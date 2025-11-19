import React, { useState, useMemo, useEffect, useCallback } from 'react';
// import ReactQuill from 'react-quill';
// import 'react-quill/dist/quill.snow.css';
import { AlertCircle, BookOpen, Save, Lightbulb, CheckCircle } from 'lucide-react';
import { Button } from '../../../../../components-v2/Button';
import { Input } from '../../../../../components-v2/Input';
import { Card } from '../../../../../components-v2/Card';
import {
  fetchJournalEntries,
  addJournalEntry,
  updateJournalEntry,
  deleteJournalEntry
} from '../../../../../services/portfolioApi';
import './TradingJournal.css';

/**
 * Trading Journal Component
 * Rich text editor for trading notes using React Quill
 * Features: API integration, auto-save
 */
export const TradingJournal = ({ userId }) => {
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    content: '',
    tags: '',
  });

  // Temporarily disabled React Quill due to React 19 compatibility issues
  // const quillModules = useMemo(() => ({
  //   toolbar: [
  //     [{ 'header': [1, 2, 3, false] }],
  //     ['bold', 'italic', 'underline', 'strike'],
  //     [{ 'list': 'ordered'}, { 'list': 'bullet' }],
  //     [{ 'color': [] }, { 'background': [] }],
  //     ['link', 'image'],
  //     ['clean']
  //   ],
  // }), []);

  // const quillFormats = [
  //   'header',
  //   'bold', 'italic', 'underline', 'strike',
  //   'list', 'bullet',
  //   'color', 'background',
  //   'link', 'image'
  // ];

  // Load journal entries on mount
  useEffect(() => {
    const loadEntries = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await fetchJournalEntries(userId);

        if (error) throw error;

        // Transform API data to component format
        const transformedEntries = (data || []).map(entry => ({
          id: entry.id,
          title: entry.title,
          date: entry.entry_date?.split('T')[0] || entry.created_at?.split('T')[0],
          content: entry.content,
          tags: entry.tags || [],
        }));

        setEntries(transformedEntries);
        setError(null);
      } catch (err) {
        console.error('Failed to load journal entries:', err);
        setError(err.message || 'Failed to load journal entries');
      } finally {
        setLoading(false);
      }
    };

    loadEntries();
  }, [userId]);

  // Auto-save functionality with debouncing
  useEffect(() => {
    if (!selectedEntry || !userId) return;
    if (!formData.title && !formData.content) return;

    const autoSaveTimer = setTimeout(async () => {
      try {
        setSaving(true);
        const tags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);

        await updateJournalEntry(selectedEntry.id, {
          title: formData.title,
          content: formData.content,
          tags,
        });

        console.log('Entry auto-saved');
      } catch (err) {
        console.error('Auto-save failed:', err);
      } finally {
        setSaving(false);
      }
    }, 2000); // 2 second debounce

    return () => clearTimeout(autoSaveTimer);
  }, [formData.title, formData.content, formData.tags, selectedEntry, userId]);

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
      tags: Array.isArray(entry.tags) ? entry.tags.join(', ') : '',
    });
  };

  const handleSave = async () => {
    if (!userId) {
      alert('User not authenticated');
      return;
    }

    try {
      setSaving(true);
      const tags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);

      if (selectedEntry) {
        // Update existing entry
        const { data, error } = await updateJournalEntry(selectedEntry.id, {
          title: formData.title,
          content: formData.content,
          tags,
        });

        if (error) throw error;

        setEntries(entries.map(e =>
          e.id === selectedEntry.id
            ? { ...e, title: formData.title, content: formData.content, tags }
            : e
        ));

        console.log('Entry updated successfully');
      } else {
        // Create new entry
        const { data, error } = await addJournalEntry(userId, {
          title: formData.title,
          content: formData.content,
          tags,
          date: formData.date,
        });

        if (error) throw error;

        const newEntry = {
          id: data.id,
          title: formData.title,
          date: formData.date,
          content: formData.content,
          tags,
        };

        setEntries([newEntry, ...entries]);
        setSelectedEntry(newEntry);
        console.log('Entry created successfully');
      }
    } catch (err) {
      console.error('Failed to save entry:', err);
      alert('Failed to save entry. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEntry || !window.confirm('Delete this journal entry?')) {
      return;
    }

    try {
      setSaving(true);
      const { error } = await deleteJournalEntry(selectedEntry.id);

      if (error) throw error;

      setEntries(entries.filter(e => e.id !== selectedEntry.id));
      handleNewEntry();
      console.log('Entry deleted successfully');
    } catch (err) {
      console.error('Failed to delete entry:', err);
      alert('Failed to delete entry. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Handle no userId
  if (!userId) {
    return (
      <div className="trading-journal">
        <div className="error-state">
          <p>
            <AlertCircle size={20} style={{ display: 'inline', marginRight: '6px' }} />
            User not authenticated
          </p>
          <p className="empty-hint">Please log in to access your trading journal</p>
        </div>
      </div>
    );
  }

  // Handle loading and error states
  if (loading) {
    return (
      <div className="trading-journal">
        <div className="loading-state">
          <p>Loading journal entries...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="trading-journal">
        <div className="error-state">
          <p>
            <AlertCircle size={20} style={{ display: 'inline', marginRight: '6px' }} />
            {error}
          </p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

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
          {entries.length === 0 ? (
            <div className="empty-journal">
              <BookOpen size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
              <p className="text-muted">No journal entries yet</p>
              <p className="empty-hint">Click "New Entry" to start</p>
            </div>
          ) : (
            entries.map(entry => (
              <Card
                key={entry.id}
                variant={selectedEntry?.id === entry.id ? 'outlined' : 'default'}
                className="entry-card"
                onClick={() => handleSelectEntry(entry)}
              >
                <div className="entry-date">{new Date(entry.date).toLocaleDateString()}</div>
                <div className="entry-title">{entry.title || 'Untitled'}</div>
                <div className="entry-tags">
                  {(entry.tags || []).map((tag, idx) => (
                    <span key={`${tag}-${idx}`} className="tag">{tag}</span>
                  ))}
                </div>
              </Card>
            ))
          )}
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
              <Button variant="outline" size="sm" onClick={handleDelete} disabled={saving}>
                Delete
              </Button>
            )}
            <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : (
                <>
                  <Save size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  Save
                </>
              )}
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

          {/* Simple Text Editor (React Quill temporarily disabled due to React 19 incompatibility) */}
          <div className="editor-field">
            <label className="editor-label">Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              placeholder="Write your trading notes here..."
              className="simple-editor"
              rows={10}
            />
            <p className="editor-note">
              <Lightbulb size={14} style={{ display: 'inline', marginRight: '4px' }} />
              Rich text editor will be added once React Quill supports React 19
            </p>
          </div>

          <Input
            type="text"
            label="Tags (comma-separated)"
            placeholder="BTC, DPD, Win..."
            value={formData.tags}
            onChange={(e) => setFormData({...formData, tags: e.target.value})}
          />

          <div className="auto-save-indicator">
            {selectedEntry && (
              <span className="text-muted">
                {saving ? (
                  <>
                    <Save size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    Auto-save enabled (2s delay)
                  </>
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingJournal;
