import React, { useState } from 'react';
import { Button } from '../../../../../components-v2/Button';
import { Input } from '../../../../../components-v2/Input';
import { Card } from '../../../../../components-v2/Card';
import './TradingJournal.css';

/**
 * Trading Journal Component
 * Rich text editor for trading notes
 *
 * NOTE: For production, use a rich text editor library:
 * - Draft.js (Facebook)
 * - Quill
 * - TipTap
 * - Slate
 *
 * npm install react-quill
 */
export const TradingJournal = () => {
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [entries, setEntries] = useState([
    {
      id: 1,
      title: 'BTC Trade Analysis - Nov 10',
      date: '2024-11-10',
      content: 'Entered BTC/USDT DPD pattern at $42,150. Strong support at $41,800. Target: $43,500.',
      tags: ['BTC', 'DPD', 'Win'],
    },
    {
      id: 2,
      title: 'ETH Setup Review',
      date: '2024-11-09',
      content: 'UPU pattern on ETH. Entry was premature, stopped out. Need to wait for confirmation.',
      tags: ['ETH', 'UPU', 'Loss', 'Lesson'],
    },
  ]);

  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    content: '',
    tags: '',
  });

  const handleNewEntry = () => {
    setSelectedEntry(null);
    setFormData({
      title: '',
      date: new Date().toISOString().split('T')[0],
      content: '',
      tags: '',
    });
  };

  const handleSelectEntry = (entry) => {
    setSelectedEntry(entry);
    setFormData({
      title: entry.title,
      date: entry.date,
      content: entry.content,
      tags: entry.tags.join(', '),
    });
  };

  const handleSave = () => {
    if (selectedEntry) {
      // Update existing entry
      setEntries(entries.map(e =>
        e.id === selectedEntry.id
          ? { ...selectedEntry, ...formData, tags: formData.tags.split(',').map(t => t.trim()) }
          : e
      ));
    } else {
      // Create new entry
      const newEntry = {
        id: entries.length + 1,
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      };
      setEntries([newEntry, ...entries]);
    }
    console.log('Entry saved!');
  };

  const handleDelete = () => {
    if (selectedEntry && window.confirm('Delete this journal entry?')) {
      setEntries(entries.filter(e => e.id !== selectedEntry.id));
      handleNewEntry();
    }
  };

  return (
    <div className="trading-journal">
      {/* Sidebar: Entry List */}
      <div className="journal-sidebar">
        <Button
          variant="primary"
          size="sm"
          icon="+"
          fullWidth
          onClick={handleNewEntry}
        >
          New Entry
        </Button>

        <div className="entry-list">
          {entries.map(entry => (
            <Card
              key={entry.id}
              variant={selectedEntry?.id === entry.id ? 'outlined' : 'default'}
              className="entry-card"
              onClick={() => handleSelectEntry(entry)}
            >
              <div className="entry-date">{new Date(entry.date).toLocaleDateString()}</div>
              <div className="entry-title">{entry.title}</div>
              <div className="entry-tags">
                {entry.tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Main: Editor */}
      <div className="journal-editor">
        <div className="editor-header">
          <h3 className="heading-sm">
            {selectedEntry ? 'Edit Entry' : 'New Entry'}
          </h3>
          <div className="editor-actions">
            {selectedEntry && (
              <Button variant="outline" size="sm" onClick={handleDelete}>
                Delete
              </Button>
            )}
            <Button variant="primary" size="sm" onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>

        <div className="editor-form">
          <Input
            type="text"
            label="Title"
            placeholder="Entry title..."
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />

          <Input
            type="date"
            label="Date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
          />

          {/* Rich Text Editor Placeholder */}
          <div className="editor-field">
            <label className="editor-label">Content</label>
            <div className="rich-text-editor-placeholder">
              <div className="editor-toolbar">
                <button className="toolbar-btn" title="Bold">B</button>
                <button className="toolbar-btn" title="Italic">I</button>
                <button className="toolbar-btn" title="Underline">U</button>
                <span className="toolbar-divider">|</span>
                <button className="toolbar-btn" title="Bullet List">•</button>
                <button className="toolbar-btn" title="Numbered List">1.</button>
                <span className="toolbar-divider">|</span>
                <button className="toolbar-btn" title="Link">🔗</button>
                <button className="toolbar-btn" title="Image">🖼️</button>
              </div>
              <textarea
                className="editor-textarea"
                placeholder="Write your trading notes here..."
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                rows={12}
              />
              <div className="editor-hint">
                💡 Integrate a rich text editor library (Quill, Draft.js, TipTap) for full formatting
              </div>
            </div>
          </div>

          <Input
            type="text"
            label="Tags (comma-separated)"
            placeholder="BTC, DPD, Win..."
            value={formData.tags}
            onChange={(e) => setFormData({...formData, tags: e.target.value})}
          />

          <div className="auto-save-indicator">
            <span className="text-muted">✅ Auto-save enabled (placeholder)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingJournal;
