import React, { useState, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from '../../../../../components-v2/Button';
import { Input } from '../../../../../components-v2/Input';
import { Card } from '../../../../../components-v2/Card';
import './TradingJournal.css';

/**
 * Trading Journal Component
 * Rich text editor for trading notes using React Quill
 */
export const TradingJournal = () => {
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [entries, setEntries] = useState([
    {
      id: 1,
      title: 'BTC Trade Analysis - Nov 10',
      date: '2024-11-10',
      content: '<p>Entered BTC/USDT <strong>DPD pattern</strong> at $42,150.</p><p>Strong support at $41,800. Target: $43,500.</p>',
      tags: ['BTC', 'DPD', 'Win'],
    },
    {
      id: 2,
      title: 'ETH Setup Review',
      date: '2024-11-09',
      content: '<p>UPU pattern on ETH. Entry was <em>premature</em>, stopped out.</p><p><strong>Lesson:</strong> Need to wait for confirmation.</p>',
      tags: ['ETH', 'UPU', 'Loss', 'Lesson'],
    },
  ]);

  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    content: '',
    tags: '',
  });

  // Quill toolbar configuration
  const quillModules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'image'],
      ['clean']
    ],
  }), []);

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'color', 'background',
    'link', 'image'
  ];

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

          {/* Rich Text Editor */}
          <div className="editor-field">
            <label className="editor-label">Content</label>
            <ReactQuill
              theme="snow"
              value={formData.content}
              onChange={(value) => setFormData({...formData, content: value})}
              modules={quillModules}
              formats={quillFormats}
              placeholder="Write your trading notes here..."
              className="quill-editor"
            />
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
