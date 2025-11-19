import React from 'react';
import './LearningPaths.css';

export const LearningPaths = ({ paths, onStartPath }) => {
  const getDifficultyBadge = (difficulty) => {
    const badges = {
      beginner: { label: 'Beginner', color: '#00FF88', icon: '🌱' },
      intermediate: { label: 'Intermediate', color: '#FFB800', icon: '🔥' },
      advanced: { label: 'Advanced', color: '#FF6B9D', icon: '💎' }
    };
    return badges[difficulty] || badges.beginner;
  };

  return (
    <section className="learning-paths-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <h2 className="section-title">
            🎯 Recommended Learning Paths
          </h2>
          <p className="section-subtitle">
            Follow structured paths designed by experts to master crypto trading
            and spiritual wellness
          </p>
        </div>

        {/* Paths Grid */}
        <div className="paths-grid">
          {paths.map(path => {
            const badge = getDifficultyBadge(path.difficulty);

            return (
              <div key={path.id} className="path-card">
                {/* Glow Background */}
                <div className="path-card-glow"></div>

                {/* Header */}
                <div className="path-header">
                  <div className="path-icon-wrapper">
                    <span className="path-icon">{path.icon}</span>
                  </div>

                  <div className="path-header-content">
                    <div className="path-badges">
                      <span
                        className="difficulty-badge"
                        style={{
                          background: `${badge.color}20`,
                          color: badge.color,
                          borderColor: `${badge.color}40`
                        }}
                      >
                        {badge.icon} {badge.label}
                      </span>
                      <span className="course-count-badge">
                        {path.courseCount} courses
                      </span>
                    </div>

                    <h3 className="path-name">{path.name}</h3>
                    <p className="path-description">{path.description}</p>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="path-stats">
                  <div className="stat">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                      <path d="M12 6v6l4 2" strokeWidth="2"/>
                    </svg>
                    <span>{path.totalHours} hours</span>
                  </div>
                  <div className="stat">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M12 14l9-5-9-5-9 5 9 5z" strokeWidth="2"/>
                      <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" strokeWidth="2"/>
                    </svg>
                    <span>Certificate</span>
                  </div>
                </div>

                {/* Progress */}
                <div className="path-progress-section">
                  <div className="progress-header">
                    <span className="progress-label">Your Progress</span>
                    <span className="progress-percentage">{path.progress}%</span>
                  </div>

                  <div className="progress-track">
                    <div
                      className="progress-fill-path"
                      style={{ width: `${path.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Course List */}
                <div className="path-courses">
                  {path.courses.map((course, index) => (
                    <div
                      key={course.id}
                      className={`path-course-item ${course.completed ? 'completed' : ''}`}
                    >
                      <div className="course-number">{index + 1}</div>

                      <div className="course-details">
                        <span className="course-name">{course.name}</span>
                        <span className="course-duration">{course.duration}</span>
                      </div>

                      {course.completed ? (
                        <div className="completed-check">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                        </div>
                      ) : (
                        <div className="course-lock">
                          <svg viewBox="0 0 24 24" fill="currentColor" opacity="0.3">
                            <circle cx="12" cy="12" r="10"/>
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <button
                  className="btn-start-path"
                  onClick={() => onStartPath(path.id)}
                >
                  {path.progress > 0 ? (
                    <>
                      <span>Continue Path</span>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeWidth="2"/>
                      </svg>
                    </>
                  ) : (
                    <>
                      <span>Start Learning Path</span>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M13 7l5 5m0 0l-5 5m5-5H6" strokeWidth="2"/>
                      </svg>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
