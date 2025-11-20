import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, Gift } from 'lucide-react';
import CompactSidebar from '../components/CompactSidebar/CompactSidebar';
import TradingCoursesSection from './sections/TradingCoursesSection';
import SpiritualCoursesSection from './sections/SpiritualCoursesSection';
import BundlesSection from './sections/BundlesSection';
import { CourseHero } from './Courses/components/CourseHero';
import { CourseCard } from './Courses/components/CourseCard';
import { LearningPaths } from './Courses/components/LearningPaths';
import { FreePreview } from './Courses/components/FreePreview';
import { SAMPLE_COURSES, SAMPLE_LEARNING_PATHS, getCoursesByCategory } from './Courses/courseData';
import { useAuth } from '../contexts/AuthContext';
import './Courses.css';

export default function Courses() {
  const [activeTab, setActiveTab] = useState('trading'); // trading | spiritual | bundles
  const [categoryFilter, setCategoryFilter] = useState('all'); // all | trading | spiritual
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useAuth();
  const userCourseTier = user?.course_tier || 'FREE';

  const tabs = [
    {
      id: 'trading',
      icon: BookOpen,
      label: 'GEM TRADING',
      description: 'Pattern Detection & Trading Mastery',
    },
    {
      id: 'spiritual',
      icon: Sparkles,
      label: 'GEM ACADEMY',
      description: 'Spiritual Transformation Courses',
    },
    {
      id: 'bundles',
      icon: Gift,
      label: 'BUNDLES & OFFERS',
      description: 'Special Package Deals',
    },
  ];

  const categories = [
    { id: 'all', name: 'All Courses', icon: '📚' },
    { id: 'trading', name: 'Trading Education', icon: '📊' },
    { id: 'spiritual', name: 'Spiritual Wellness', icon: '💜' },
  ];

  const filteredCourses = getCoursesByCategory(categoryFilter);

  const handleEnroll = (courseId) => {
    console.log('Enrolling in course:', courseId);
    // TODO: Navigate to pricing or enrollment page
  };

  const handleContinue = (courseId) => {
    console.log('Continuing course:', courseId);
    // TODO: Navigate to course learning page
    window.location.href = `/courses/${courseId}`;
  };

  const handleStartPath = (pathId) => {
    console.log('Starting learning path:', pathId);
    // TODO: Navigate to path enrollment
  };

  const handleStartFreeTrial = () => {
    console.log('Starting free trial');
    // TODO: Navigate to signup with trial
  };

  return (
    <>
      <CompactSidebar />
      <div className="page-container">
        <div className="page-content">
          {/* Tab Navigation */}
          <div className="courses-tabs">
            <div className="tabs-container">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                <button
                  key={tab.id}
                  className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={20} />
                  <div className="tab-content">
                    <span className="tab-label">{tab.label}</span>
                    <span className="tab-description">{tab.description}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="tab-content-container">
          {activeTab === 'trading' && (
            <>
              {/* Course Hero Section */}
              <CourseHero
                totalCourses={25}
                totalStudents={5000}
                completionRate={95}
              />

              {/* Category Filter Tabs */}
              <section className="category-section-courses">
                <div className="container">
                  <div className="category-tabs-courses">
                    {categories.map(category => (
                      <button
                        key={category.id}
                        className={`category-tab-course ${categoryFilter === category.id ? 'active' : ''}`}
                        onClick={() => setCategoryFilter(category.id)}
                      >
                        <span className="tab-icon">{category.icon}</span>
                        <span className="tab-label">{category.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {/* Courses Grid */}
              <section className="courses-grid-section">
                <div className="container">
                  <div className="section-header-simple">
                    <h2>Featured Courses</h2>
                    <p>Hand-picked courses to accelerate your journey</p>
                  </div>

                  {isLoading ? (
                    <div className="loading-state">
                      <div className="loading-spinner"></div>
                      <p>Loading courses...</p>
                    </div>
                  ) : (
                    <div className="courses-grid">
                      {filteredCourses.map(course => (
                        <CourseCard
                          key={course.id}
                          course={course}
                          userTier={userCourseTier}
                          onEnroll={handleEnroll}
                          onContinue={handleContinue}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* Learning Paths */}
              <LearningPaths
                paths={SAMPLE_LEARNING_PATHS}
                onStartPath={handleStartPath}
              />

              {/* Free Preview */}
              <FreePreview
                previewVideoId="preview-001"
                lessonTitle="Introduction to GEM Frequency Method"
                lessonDuration="15:30"
                onStartFreeTrial={handleStartFreeTrial}
              />

              {/* CTA Section */}
              <section className="courses-cta-section">
                <div className="container">
                  <div className="cta-content">
                    <h2>Ready to Transform Your Trading?</h2>
                    <p>Join thousands of successful traders who learned with GEM Academy</p>
                    <div className="cta-buttons">
                      <button className="btn-cta-primary" onClick={() => setCategoryFilter('all')}>
                        Browse All Courses
                      </button>
                      <button className="btn-cta-secondary" onClick={handleStartFreeTrial}>
                        Talk to an Advisor
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}

          {activeTab === 'spiritual' && <SpiritualCoursesSection />}
          {activeTab === 'bundles' && <BundlesSection />}
        </div>
      </div>
    </div>
    </>
  );
}
