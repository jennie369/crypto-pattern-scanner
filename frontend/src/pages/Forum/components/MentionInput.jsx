import React, { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import './MentionInput.css';

/**
 * MentionInput - Controlled textarea with @mention auto-complete
 * Detects @ character, searches profiles, shows dropdown suggestions
 * Returns display text + mention data [{userId, name, position}]
 */
export default function MentionInput({
  value = '',
  onChange,
  onMentionsChange,
  placeholder = 'Viết nội dung...',
  maxLength,
  rows = 4,
  disabled = false,
  className = ''
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStartPos, setMentionStartPos] = useState(-1);
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceRef = useRef(null);

  /**
   * Search profiles by name
   */
  const searchUsers = useCallback(async (query) => {
    if (!query || query.length < 1) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .ilike('full_name', `%${query}%`)
        .limit(8);

      if (!error && data) {
        setSuggestions(data);
      }
    } catch (err) {
      console.error('Error searching users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Debounced search (300ms)
   */
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (mentionQuery) {
      debounceRef.current = setTimeout(() => {
        searchUsers(mentionQuery);
      }, 300);
    } else {
      setSuggestions([]);
    }

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [mentionQuery, searchUsers]);

  /**
   * Detect @ mentions while typing
   */
  const handleChange = (e) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;
    onChange(newValue);

    // Find if cursor is inside a potential @mention
    const textBeforeCursor = newValue.substring(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@([\w\u00C0-\u024F\u1E00-\u1EFF]*)$/);

    if (mentionMatch) {
      const query = mentionMatch[1];
      const startPos = cursorPos - query.length - 1; // -1 for @
      setMentionQuery(query);
      setMentionStartPos(startPos);
      setShowSuggestions(true);
      setSelectedIndex(0);
    } else {
      setShowSuggestions(false);
      setMentionQuery('');
      setMentionStartPos(-1);
    }
  };

  /**
   * Select a mention from suggestions
   */
  const selectMention = useCallback((user) => {
    const textarea = textareaRef.current;
    if (!textarea || mentionStartPos < 0) return;

    const before = value.substring(0, mentionStartPos);
    const after = value.substring(mentionStartPos + mentionQuery.length + 1); // +1 for @
    const mentionText = `@${user.full_name}`;
    const newValue = before + mentionText + ' ' + after;

    onChange(newValue);

    // Report mention data
    if (onMentionsChange) {
      // Extract all mentions from new value
      const mentionRegex = /@([\w\u00C0-\u024F\u1E00-\u1EFF\s]+)/g;
      const mentions = [];
      let match;
      while ((match = mentionRegex.exec(newValue)) !== null) {
        mentions.push({
          userId: user.id,
          name: match[1].trim(),
          position: match.index
        });
      }
      onMentionsChange(mentions);
    }

    setShowSuggestions(false);
    setMentionQuery('');
    setMentionStartPos(-1);
    setSuggestions([]);

    // Restore focus
    setTimeout(() => {
      if (textarea) {
        const newCursorPos = mentionStartPos + mentionText.length + 1;
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  }, [value, mentionStartPos, mentionQuery, onChange, onMentionsChange]);

  /**
   * Keyboard navigation in suggestions
   */
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
        break;
      case 'Enter':
        if (showSuggestions && suggestions[selectedIndex]) {
          e.preventDefault();
          selectMention(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target) &&
        textareaRef.current &&
        !textareaRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`mention-input-container ${className}`}>
      <textarea
        ref={textareaRef}
        className="mention-input-textarea"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
        disabled={disabled}
      />

      {/* Suggestions dropdown */}
      {showSuggestions && (suggestions.length > 0 || loading || mentionQuery.length >= 1) && (
        <div className="mention-suggestions" ref={suggestionsRef}>
          {loading && suggestions.length === 0 ? (
            <div className="mention-suggestion-loading">Đang tìm...</div>
          ) : suggestions.length === 0 ? (
            <div className="mention-suggestion-empty">Không tìm thấy người dùng</div>
          ) : (
            suggestions.map((user, idx) => (
              <button
                key={user.id}
                className={`mention-suggestion-item ${idx === selectedIndex ? 'selected' : ''}`}
                onClick={() => selectMention(user)}
                onMouseEnter={() => setSelectedIndex(idx)}
              >
                <div className="mention-suggestion-avatar">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.full_name} />
                  ) : (
                    <span>{(user.full_name || 'U')[0].toUpperCase()}</span>
                  )}
                </div>
                <span className="mention-suggestion-name">{user.full_name}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
