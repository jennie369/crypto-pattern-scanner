/**
 * ExportTemplateSelector - Modal to select export format
 * Part of GemMaster web port Stream E
 */

import React from 'react';
import { X, FileText, Code, FileJson, File, Lock } from 'lucide-react';
import './ExportTemplateSelector.css';

const EXPORT_FORMATS = [
  {
    id: 'text',
    name: 'Text',
    description: 'Van ban thuan, de doc',
    icon: FileText,
    preview: 'User: Xin chao...\nBot: Chao ban...',
    minTier: 'FREE',
  },
  {
    id: 'markdown',
    name: 'Markdown',
    description: 'Dinh dang Markdown voi headers',
    icon: Code,
    preview: '## Cuoc tro chuyen\n**User:** Xin chao...\n**Bot:** Chao ban...',
    minTier: 'FREE',
  },
  {
    id: 'json',
    name: 'JSON',
    description: 'Du lieu co cau truc, import lai',
    icon: FileJson,
    preview: '{\n  "messages": [\n    { "role": "user", "content": "..." }\n  ]\n}',
    minTier: 'FREE',
  },
  {
    id: 'pdf',
    name: 'PDF',
    description: 'Tai lieu chuyen nghiep',
    icon: File,
    preview: 'Bao gom header, thoi gian,\ndinh dang dep, logo GEM',
    minTier: 'TIER3',
  },
];

const TIER_ORDER = ['FREE', 'TIER1', 'TIER2', 'TIER3'];

const isTierSufficient = (currentTier, requiredTier) => {
  const currentIdx = TIER_ORDER.indexOf(currentTier?.toUpperCase() || 'FREE');
  const requiredIdx = TIER_ORDER.indexOf(requiredTier);
  return currentIdx >= requiredIdx;
};

const ExportTemplateSelector = ({
  isOpen,
  onClose,
  onSelect,
  currentTier = 'FREE',
  messages = [],
}) => {
  if (!isOpen) return null;

  const handleSelect = (format) => {
    if (!isTierSufficient(currentTier, format.minTier)) return;
    onSelect(format.id);
  };

  return (
    <div className="export-selector-overlay" onClick={onClose}>
      <div className="export-selector" onClick={(e) => e.stopPropagation()}>
        <div className="export-selector__header">
          <h3 className="export-selector__title">Chon dinh dang xuat</h3>
          <span className="export-selector__count">{messages.length} tin nhan</span>
          <button className="export-selector__close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="export-selector__grid">
          {EXPORT_FORMATS.map((format) => {
            const Icon = format.icon;
            const locked = !isTierSufficient(currentTier, format.minTier);

            return (
              <button
                key={format.id}
                className={`export-card ${locked ? 'export-card--locked' : ''}`}
                onClick={() => handleSelect(format)}
                disabled={locked}
              >
                <div className="export-card__icon">
                  <Icon size={24} />
                  {locked && (
                    <span className="export-card__lock">
                      <Lock size={12} />
                    </span>
                  )}
                </div>
                <div className="export-card__info">
                  <h4 className="export-card__name">{format.name}</h4>
                  <p className="export-card__desc">{format.description}</p>
                </div>
                <pre className="export-card__preview">{format.preview}</pre>
                {locked && (
                  <span className="export-card__tier-badge">
                    {format.minTier}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ExportTemplateSelector;
