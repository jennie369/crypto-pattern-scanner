/**
 * RecordingIndicator - Visual recording state with pulsing dot and timer
 * Part of GemMaster web port Stream E
 */

import React from 'react';
import './RecordingIndicator.css';

const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const RecordingIndicator = ({ isRecording, duration = 0 }) => {
  if (!isRecording) return null;

  return (
    <div className="recording-indicator">
      <span className="recording-indicator__dot" />
      <span className="recording-indicator__label">Dang ghi am</span>
      <span className="recording-indicator__timer">{formatDuration(duration)}</span>
      <div className="recording-indicator__waveform">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className="recording-indicator__bar"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    </div>
  );
};

export default RecordingIndicator;
