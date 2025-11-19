import React, { useState } from 'react';
import './FreePreview.css';

export const FreePreview = ({
  previewVideoId = 'preview-001',
  lessonTitle = "Introduction to GEM Frequency Method",
  lessonDuration = "15:30",
  onStartFreeTrial
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayPreview = () => {
    setIsPlaying(true);
    console.log('Playing preview video:', previewVideoId);
  };

  return (
    <section className="free-preview-section">
      <div className="container">
        <div className="preview-container">
          <div className="preview-content">
            <div className="preview-badge">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              <span>Free Preview Available</span>
            </div>

            <h2 className="preview-title">Try Before You Buy</h2>

            <p className="preview-description">
              Watch a free lesson from our most popular course.
              Experience the quality of GEM education with no commitment.
            </p>

            <ul className="preview-benefits">
              <li>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>No credit card required</span>
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>Full HD video quality</span>
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>English & Vietnamese subtitles</span>
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>Downloadable resources</span>
              </li>
            </ul>

            <button className="btn-free-trial" onClick={onStartFreeTrial}>
              <span>Start Free Trial</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M13 7l5 5m0 0l-5 5m5-5H6" strokeWidth="2"/>
              </svg>
            </button>
          </div>

          <div className="preview-player-wrapper">
            <div className="preview-player">
              {!isPlaying ? (
                <div className="player-placeholder" onClick={handlePlayPreview}>
                  <div className="placeholder-bg">
                    <div className="placeholder-overlay"></div>
                    <div className="play-button-large">
                      <div className="play-icon-large">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    </div>
                    <div className="video-info">
                      <h4 className="video-title">{lessonTitle}</h4>
                      <div className="video-meta">
                        <span className="video-duration">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                            <path d="M12 6v6l4 2" strokeWidth="2"/>
                          </svg>
                          {lessonDuration}
                        </span>
                        <span className="video-quality">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <rect x="2" y="3" width="20" height="14" rx="2" strokeWidth="2"/>
                            <path d="M8 21h8M12 17v4" strokeWidth="2"/>
                          </svg>
                          1080p HD
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="tevello-player-placeholder">
                  <p>🎬 Tevello Video Player will be integrated here</p>
                  <p className="placeholder-note">Video ID: {previewVideoId}</p>
                </div>
              )}
            </div>

            <div className="player-features">
              <div className="feature-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M15.75 5.25v13.5m-7.5-13.5v13.5" strokeWidth="2"/>
                </svg>
                <span>Pause anytime</span>
              </div>
              <div className="feature-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2"/>
                  <path d="M9 12l2 2 4-4" strokeWidth="2"/>
                </svg>
                <span>Track progress</span>
              </div>
              <div className="feature-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeWidth="2"/>
                </svg>
                <span>Subtitles</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
