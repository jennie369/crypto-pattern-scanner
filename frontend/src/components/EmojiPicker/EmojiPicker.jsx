import React, { useState, useRef, useEffect } from 'react';
import { Smile } from 'lucide-react';
import './EmojiPicker.css';

/**
 * EmojiPicker Component
 * Simple emoji picker for message input
 *
 * @param {function} onEmojiSelect - Callback when emoji is selected (emoji) => void
 * @param {boolean} showButton - Whether to show the smile button (default: true)
 */
export default function EmojiPicker({ onEmojiSelect, showButton = true }) {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef(null);

  // Emoji categories
  const emojiCategories = {
    'Smileys': ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔'],
    'Gestures': ['👍', '👎', '👊', '✊', '🤛', '🤜', '🤞', '✌️', '🤟', '🤘', '👌', '🤏', '👈', '👉', '👆', '👇', '☝️', '👏', '🙌', '👐', '🤲', '🙏', '💪'],
    'Love': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '💕', '💞', '💓', '💗', '💖', '💘', '💝'],
    'Celebration': ['🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🥈', '🥉', '⭐', '🌟', '✨', '💫', '🔥', '💯', '✅'],
    'Nature': ['🌸', '🌺', '🌻', '🌹', '🌷', '🌼', '🌱', '🌿', '🍀', '🌾', '🌲', '🌳', '🌴', '🌵', '🌾'],
    'Food': ['🍕', '🍔', '🍟', '🌭', '🍿', '🥓', '🥚', '🍳', '🥞', '🧇', '🧈', '🍞', '🥐', '🥖', '🥨', '🥯', '🧀'],
    'Crypto': ['💰', '💵', '💴', '💶', '💷', '💸', '💳', '🪙', '📈', '📉', '💹', '🚀', '🌙', '⚡', '🔮']
  };

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPicker]);

  const handleEmojiClick = (emoji) => {
    if (onEmojiSelect) {
      onEmojiSelect(emoji);
    }
    setShowPicker(false);
  };

  const handleTogglePicker = () => {
    setShowPicker(!showPicker);
  };

  return (
    <div className="emoji-picker-container" ref={pickerRef}>
      {showButton && (
        <button
          type="button"
          className="btn-emoji"
          onClick={handleTogglePicker}
          title="Add emoji"
        >
          <Smile size={20} />
        </button>
      )}

      {showPicker && (
        <div className="emoji-picker-popup">
          <div className="emoji-picker-header">
            <h4>Select Emoji</h4>
          </div>

          <div className="emoji-picker-content">
            {Object.entries(emojiCategories).map(([category, emojis]) => (
              <div key={category} className="emoji-category">
                <div className="emoji-category-label">{category}</div>
                <div className="emoji-grid">
                  {emojis.map((emoji, index) => (
                    <button
                      key={`${category}-${index}`}
                      type="button"
                      className="emoji-button"
                      onClick={() => handleEmojiClick(emoji)}
                      title={emoji}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
