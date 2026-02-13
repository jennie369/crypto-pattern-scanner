/**
 * AffirmationCard Component
 * Displays an affirmation with favorite toggle
 *
 * @fileoverview Beautiful affirmation display card
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, RefreshCw, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { COLORS, ANIMATION } from '../../../../web design-tokens';
import { AFFIRMATION_CATEGORIES } from '../../services/visionBoard/affirmationService';
import './AffirmationCard.css';

/**
 * AffirmationCard - Display affirmation with interactions
 *
 * @param {Object} affirmation - Affirmation data
 * @param {Function} onFavorite - Toggle favorite callback
 * @param {Function} onNext - Get next affirmation callback
 * @param {Function} onRead - Log reading callback
 * @param {boolean} showControls - Show interaction buttons
 */
const AffirmationCard = ({
  affirmation,
  onFavorite,
  onNext,
  onRead,
  showControls = true,
  className = '',
}) => {
  const [isSpeaking, setIsSpeaking] = React.useState(false);

  if (!affirmation) {
    return (
      <div className={`affirmation-card affirmation-card-empty ${className}`}>
        <Sparkles size={32} className="affirmation-card-empty-icon" />
        <p>No affirmation for today</p>
        <span>Create your first affirmation to get started!</span>
      </div>
    );
  }

  const category = AFFIRMATION_CATEGORIES.find((c) => c.key === affirmation.category);

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(affirmation.text);
      utterance.lang = 'vi-VN';
      utterance.rate = 0.9;

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);

      // Log reading
      onRead?.(affirmation.id);
    }
  };

  const handleFavorite = () => {
    onFavorite?.(affirmation.id);
  };

  const handleNext = () => {
    onNext?.();
    // Log reading when viewing
    onRead?.(affirmation.id);
  };

  return (
    <motion.div
      className={`affirmation-card ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* Decorative sparkles */}
      <div className="affirmation-card-sparkle affirmation-card-sparkle-1">
        <Sparkles size={16} />
      </div>
      <div className="affirmation-card-sparkle affirmation-card-sparkle-2">
        <Sparkles size={12} />
      </div>

      {/* Category badge */}
      {category && (
        <div
          className="affirmation-card-category"
          style={{
            backgroundColor: `${category.color}20`,
            color: category.color,
          }}
        >
          {category.label}
        </div>
      )}

      {/* Text */}
      <AnimatePresence mode="wait">
        <motion.p
          key={affirmation.id}
          className="affirmation-card-text"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          "{affirmation.text}"
        </motion.p>
      </AnimatePresence>

      {/* Controls */}
      {showControls && (
        <div className="affirmation-card-controls">
          {/* Speak button */}
          <button
            className="affirmation-card-btn"
            onClick={handleSpeak}
            aria-label={isSpeaking ? 'Stop speaking' : 'Read aloud'}
            title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
          >
            {isSpeaking ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>

          {/* Favorite button */}
          <button
            className={`affirmation-card-btn affirmation-card-btn-favorite ${affirmation.is_favorite ? 'is-favorite' : ''}`}
            onClick={handleFavorite}
            aria-label={affirmation.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
            title={affirmation.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              size={20}
              fill={affirmation.is_favorite ? COLORS.error : 'none'}
              color={affirmation.is_favorite ? COLORS.error : 'currentColor'}
            />
          </button>

          {/* Next button */}
          <button
            className="affirmation-card-btn"
            onClick={handleNext}
            aria-label="Next affirmation"
            title="Next affirmation"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default AffirmationCard;
