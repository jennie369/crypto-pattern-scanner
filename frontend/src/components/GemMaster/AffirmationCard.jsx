import React, { useState, useCallback } from 'react';
import { Volume2, Check, ChevronLeft, ChevronRight, Flame, Sparkles } from 'lucide-react';
import './WidgetCards.css';

const AffirmationCard = ({ affirmation, onShare, onDismiss }) => {
  const data = affirmation?.data || affirmation || {};
  const affirmations = data.affirmations || [];
  const [currentIndex, setCurrentIndex] = useState(data.currentIndex || 0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const currentText = affirmations[currentIndex] || 'No affirmations available';
  const completedToday = data.completedToday || 0;
  const streak = data.streak || 0;

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < affirmations.length - 1) setCurrentIndex(currentIndex + 1);
  }, [currentIndex, affirmations.length]);

  const handleReadAloud = useCallback(() => {
    if (isSpeaking) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
      return;
    }

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentText);
      utterance.lang = 'vi-VN';
      utterance.rate = 0.8;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  }, [isSpeaking, currentText]);

  const handleMarkDone = useCallback(() => {
    onShare?.({ currentIndex, completed: true });
    if (currentIndex < affirmations.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, affirmations.length, onShare]);

  return (
    <div className="widget-card widget-card--affirmation">
      {/* Header */}
      <div className="widget-card__header widget-card__header--center">
        <Sparkles size={18} color="#FFBD59" />
        <span className="widget-card__title">Today&apos;s Affirmation</span>
      </div>

      {/* Affirmation Text */}
      <div className="affirmation-card__text-container">
        <p className="affirmation-card__text">{currentText}</p>
      </div>

      {/* Actions */}
      <div className="affirmation-card__actions">
        <button className="affirmation-card__read-btn" onClick={handleReadAloud}>
          <Volume2 size={18} color={isSpeaking ? '#EF4444' : '#FFBD59'} />
          <span style={{ color: isSpeaking ? '#EF4444' : '#FFBD59' }}>
            {isSpeaking ? 'Stop' : 'Doc'}
          </span>
        </button>
        <button className="affirmation-card__done-btn" onClick={handleMarkDone}>
          <Check size={18} color="#0A0F1C" />
          <span>Xong</span>
        </button>
      </div>

      {/* Navigation */}
      {affirmations.length > 1 && (
        <div className="affirmation-card__navigation">
          <button
            className="affirmation-card__nav-btn"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft size={20} color={currentIndex === 0 ? '#4A5568' : '#FFBD59'} />
          </button>
          <span className="affirmation-card__nav-text">
            {currentIndex + 1} / {affirmations.length}
          </span>
          <button
            className="affirmation-card__nav-btn"
            onClick={handleNext}
            disabled={currentIndex === affirmations.length - 1}
          >
            <ChevronRight size={20} color={currentIndex === affirmations.length - 1 ? '#4A5568' : '#FFBD59'} />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="affirmation-card__stats">
        <div className="affirmation-card__stat">
          <Check size={14} color="#10B981" />
          <span>Hoan thanh {completedToday}x hom nay</span>
        </div>
        <div className="affirmation-card__stat affirmation-card__stat--streak">
          <Flame size={14} color="#EF4444" />
          <span>{streak}-ngay streak</span>
        </div>
      </div>
    </div>
  );
};

export default AffirmationCard;
