import React from 'react';
import './CourseHero.css';

export const CourseHero = ({
  totalCourses = 25,
  totalStudents = 5000,
  completionRate = 95
}) => {
  return (
    <section className="course-hero">
      {/* Background Glow Layers - Blue Theme */}
      <div className="hero-glow-container">
        <div className="glow-orb glow-orb-blue-1"></div>
        <div className="glow-orb glow-orb-blue-2"></div>
        <div className="particles-bg"></div>
      </div>

      {/* Floating Crystal Center */}
      <div className="crystal-container">
        <div className="crystal-glow-blue"></div>
        <div className="crystal-core-blue">
          <svg viewBox="0 0 200 200" className="crystal-svg">
            {/* Diamond Shape - Blue */}
            <polygon
              points="100,20 180,100 100,180 20,100"
              fill="url(#crystalGradientBlue)"
              className="crystal-facet-blue"
            />
            <defs>
              <linearGradient id="crystalGradientBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00D9FF" />
                <stop offset="50%" stopColor="#4A90E2" />
                <stop offset="100%" stopColor="#00B4D8" />
              </linearGradient>
              <filter id="innerGlow">
                <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur"/>
                <feComposite in="SourceGraphic" in2="blur" operator="over"/>
              </filter>
            </defs>
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="hero-content">
        <h1 className="hero-title">
          Master Crypto Trading &
          <span className="title-highlight-blue"> Spiritual Wellness</span>
        </h1>

        <p className="hero-subtitle">
          Learn from Gemrals. Transform your wealth
          and wellbeing together.
        </p>

        <div className="hero-cta-group">
          <button className="btn-hero-primary-blue">
            <span>Browse Courses</span>
            <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M5 12h14M12 5l7 7-7 7" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>

          <button className="btn-hero-secondary-blue">
            Try Free Course
          </button>
        </div>

        {/* Stats Row */}
        <div className="hero-stats">
          <div className="stat-item">
            <div className="stat-value stat-value-blue">{totalCourses}+</div>
            <div className="stat-label">Courses</div>
          </div>

          <div className="stat-divider stat-divider-blue"></div>

          <div className="stat-item">
            <div className="stat-value stat-value-blue">
              {(totalStudents / 1000).toFixed(1)}K+
            </div>
            <div className="stat-label">Students</div>
          </div>

          <div className="stat-divider stat-divider-blue"></div>

          <div className="stat-item">
            <div className="stat-value stat-value-blue">{completionRate}%</div>
            <div className="stat-label">Completion Rate</div>
            <div className="stat-icon">📈</div>
          </div>
        </div>
      </div>
    </section>
  );
};
