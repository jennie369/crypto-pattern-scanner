/**
 * ExportPreview - Preview modal before downloading exported chat
 * Part of GemMaster web port Stream E
 */

import React, { useMemo } from 'react';
import { X, Download, FileText, Code, FileJson, File } from 'lucide-react';
import './ExportPreview.css';

const FORMAT_META = {
  text: { label: 'Text', icon: FileText },
  markdown: { label: 'Markdown', icon: Code },
  json: { label: 'JSON', icon: FileJson },
  pdf: { label: 'PDF', icon: File },
};

const ExportPreview = ({
  isOpen,
  onClose,
  onConfirm,
  format = 'text',
  content = '',
  messages = [],
}) => {
  if (!isOpen) return null;

  const meta = FORMAT_META[format] || FORMAT_META.text;
  const Icon = meta.icon;

  const previewContent = useMemo(() => {
    if (content) return content;

    // Generate preview from messages
    if (format === 'json') {
      const data = messages
        .filter(m => m.type === 'user' || m.type === 'bot')
        .map(m => ({
          role: m.type === 'user' ? 'user' : 'assistant',
          content: m.content,
          timestamp: m.timestamp,
        }));
      return JSON.stringify({ messages: data, exportedAt: new Date().toISOString() }, null, 2);
    }

    if (format === 'markdown') {
      let md = `# Cuoc tro chuyen Gem Master\n`;
      md += `> Ngay: ${new Date().toLocaleDateString('vi-VN')}\n\n`;
      messages.forEach(m => {
        if (m.type === 'user') md += `**Ban:** ${m.content}\n\n`;
        else if (m.type === 'bot') md += `**Gem Master:** ${m.content}\n\n`;
      });
      return md;
    }

    // Default: text
    let txt = `Cuoc tro chuyen Gem Master - ${new Date().toLocaleDateString('vi-VN')}\n`;
    txt += '='.repeat(50) + '\n\n';
    messages.forEach(m => {
      if (m.type === 'user') txt += `Ban: ${m.content}\n\n`;
      else if (m.type === 'bot') txt += `Gem Master: ${m.content}\n\n`;
    });
    return txt;
  }, [content, format, messages]);

  return (
    <div className="export-preview-overlay" onClick={onClose}>
      <div className="export-preview" onClick={(e) => e.stopPropagation()}>
        <div className="export-preview__header">
          <div className="export-preview__title-row">
            <Icon size={18} />
            <h3 className="export-preview__title">Xem truoc - {meta.label}</h3>
          </div>
          <button className="export-preview__close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="export-preview__content">
          <pre className="export-preview__text">{previewContent}</pre>
        </div>

        <div className="export-preview__actions">
          <button className="export-preview__cancel" onClick={onClose}>
            Huy
          </button>
          <button className="export-preview__download" onClick={() => onConfirm(previewContent)}>
            <Download size={16} />
            Tai xuong
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportPreview;
