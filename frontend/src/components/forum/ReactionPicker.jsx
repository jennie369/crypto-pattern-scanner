/**
 * ReactionPicker Component
 * Multiple emoji reactions like Facebook
 * Uses design tokens for consistent styling
 */

import React, { useState, useRef, useEffect } from 'react';
import { Heart, ThumbsUp, ThumbsDown, Laugh, Frown, Sparkles, Flame, Lightbulb } from 'lucide-react';
import './ReactionPicker.css';

// Available reactions
const REACTIONS = [
  { id: 'like', emoji: '👍', label: 'Thích', icon: ThumbsUp, color: '#00D9FF' },
  { id: 'love', emoji: '❤️', label: 'Yêu thích', icon: Heart, color: '#FF4757' },
  { id: 'haha', emoji: '😂', label: 'Haha', icon: Laugh, color: '#FFBD59' },
  { id: 'wow', emoji: '😮', label: 'Wow', icon: Sparkles, color: '#8B5CF6' },
  { id: 'sad', emoji: '😢', label: 'Buồn', icon: Frown, color: '#7B68EE' },
  { id: 'angry', emoji: '😡', label: 'Phẫn nộ', icon: Flame, color: '#FF6B6B' },
  { id: 'bullish', emoji: '🚀', label: 'Bullish', icon: ThumbsUp, color: '#00FF88' },
  { id: 'bearish', emoji: '📉', label: 'Bearish', icon: ThumbsDown, color: '#FF4757' },
  { id: 'gem', emoji: '💎', label: 'Gem', icon: Lightbulb, color: '#00D9FF' },
];

export function ReactionPicker({
  postId,
  currentReaction = null,
  reactionCounts = {},
  onReact,
  disabled = false,
  showCounts = true
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredReaction, setHoveredReaction] = useState(null);
  const pickerRef = useRef(null);
  const timeoutRef = useRef(null);

  // Get current reaction info
  const activeReaction = currentReaction
    ? REACTIONS.find(r => r.id === currentReaction)
    : null;

  // Calculate total reactions
  const totalReactions = Object.values(reactionCounts).reduce((sum, count) => sum + count, 0);

  // Get top 3 reactions for display
  const topReactions = Object.entries(reactionCounts)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([id]) => REACTIONS.find(r => r.id === id))
    .filter(Boolean);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle mouse enter with delay
  const handleMouseEnter = () => {
    if (disabled) return;
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsOpen(true);
    }, 300);
  };

  // Handle mouse leave with delay
  const handleMouseLeave = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setHoveredReaction(null);
    }, 300);
  };

  // Handle reaction click
  const handleReact = (reactionId) => {
    if (disabled) return;

    // If clicking the same reaction, remove it
    const newReaction = currentReaction === reactionId ? null : reactionId;
    onReact(postId, newReaction);
    setIsOpen(false);
  };

  // Handle quick like (click on button)
  const handleQuickLike = () => {
    if (disabled) return;

    if (currentReaction) {
      // Remove reaction
      onReact(postId, null);
    } else {
      // Add default "like" reaction
      onReact(postId, 'like');
    }
  };

  return (
    <div
      className="reaction-picker-container"
      ref={pickerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main Button */}
      <button
        className={`reaction-button ${activeReaction ? 'active' : ''}`}
        onClick={handleQuickLike}
        disabled={disabled}
        style={activeReaction ? { color: activeReaction.color } : {}}
      >
        {activeReaction ? (
          <span className="reaction-emoji">{activeReaction.emoji}</span>
        ) : (
          <Heart size={18} />
        )}
        <span className="reaction-label">
          {activeReaction ? activeReaction.label : 'Thích'}
        </span>
      </button>

      {/* Reaction Counts */}
      {showCounts && totalReactions > 0 && (
        <div className="reaction-counts">
          <div className="reaction-icons">
            {topReactions.map((reaction) => (
              <span key={reaction.id} className="reaction-count-emoji">
                {reaction.emoji}
              </span>
            ))}
          </div>
          <span className="reaction-total">{totalReactions}</span>
        </div>
      )}

      {/* Picker Popup */}
      {isOpen && (
        <div className="reaction-picker-popup">
          {REACTIONS.map((reaction) => (
            <button
              key={reaction.id}
              className={`reaction-option ${currentReaction === reaction.id ? 'selected' : ''} ${hoveredReaction === reaction.id ? 'hovered' : ''}`}
              onClick={() => handleReact(reaction.id)}
              onMouseEnter={() => setHoveredReaction(reaction.id)}
              onMouseLeave={() => setHoveredReaction(null)}
              title={reaction.label}
            >
              <span className="option-emoji">{reaction.emoji}</span>
              {hoveredReaction === reaction.id && (
                <span className="option-tooltip">{reaction.label}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReactionPicker;
