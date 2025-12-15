import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Sparkles, Loader2, AlertCircle, Search } from 'lucide-react';
import CompactSidebar from '../components/CompactSidebar/CompactSidebar';
import { CourseHero } from './Courses/components/CourseHero';
import { CourseCard } from './Courses/components/CourseCard';
import { FreePreview } from './Courses/components/FreePreview';
import { useAuth } from '../contexts/AuthContext';
import { courseService } from '../services/courseService';
import { enrollmentService } from '../services/enrollmentService';
import { progressService } from '../services/progressService';
import './Courses.css';

export default function Courses() {
  const navigate = useNavigate();
  const [categoryFilter, setCategoryFilter] = useState('all'); // all | trading | spiritual
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [userEnrollments, setUserEnrollments] = useState([]);
  const [courseStats, setCourseStats] = useState({ totalCourses: 0, totalStudents: 0, completionRate: 0 });
  const [error, setError] = useState(null);

  const { user } = useAuth();
  const userCourseTier = user?.course_tier || 'FREE';

  const categories = [
    { id: 'all', name: 'Tất cả khóa học', icon: BookOpen },
    { id: 'trading', name: 'GEM Trading', icon: BookOpen },
    { id: 'spiritual', name: 'GEM Academy', icon: Sparkles },
  ];

  // Fetch courses from Supabase
  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const options = {};
      if (categoryFilter !== 'all') {
        options.category = categoryFilter;
      }
      if (searchQuery.trim()) {
        options.search = searchQuery.trim();
      }

      const data = await courseService.getPublishedCourses(options);
      setCourses(data);

      // Calculate stats
      const totalStudents = data.reduce((sum, c) => sum + (c.studentCount || 0), 0);
      setCourseStats({
        totalCourses: data.length,
        totalStudents,
        completionRate: 95, // Could calculate from real data
      });
    } catch (err) {
      console.error('[Courses] Error fetching courses:', err);
      setError('Không thể tải danh sách khóa học. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, [categoryFilter, searchQuery]);

  // Fetch user enrollments
  const fetchUserEnrollments = useCallback(async () => {
    if (!user?.id) return;
    try {
      const enrollments = await enrollmentService.getUserEnrollments(user.id);
      setUserEnrollments(enrollments);
    } catch (err) {
      console.error('[Courses] Error fetching enrollments:', err);
    }
  }, [user?.id]);

  // Initial data fetch
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Fetch user data when logged in
  useEffect(() => {
    fetchUserEnrollments();
  }, [fetchUserEnrollments]);

  // Get filtered courses with enrollment data
  const getCoursesWithEnrollment = () => {
    return courses.map(course => {
      const enrollment = userEnrollments.find(e => e.course_id === course.id);
      return {
        ...course,
        progress: enrollment?.progress_percentage,
        isEnrolled: !!enrollment,
        // Map to expected CourseCard format
        tier: normalizeTier(course.tier_required),
        // Use real data from database (via courseService transform)
        rating: course.rating || 0, // Real rating from DB
        studentCount: course.studentCount || 0, // students_count from DB
        duration: formatDuration(course.durationMinutes), // duration_hours * 60 from service
        lessonCount: course.lessonCount || 0, // total_lessons from DB
        price: course.price || 0,
        thumbnail: course.thumbnail || null, // thumbnail_url from DB
      };
    });
  };

  // Helper: Normalize tier string for CourseCard
  // CourseCard expects lowercase tier keys (free, tier1, tier2, tier3)
  const normalizeTier = (tierString) => {
    if (!tierString) return 'free';
    // Convert TIER1 -> tier1, FREE -> free
    return tierString.toLowerCase();
  };

  // Helper: Format duration
  const formatDuration = (minutes) => {
    if (!minutes) return '0 phút';
    if (minutes < 60) return `${minutes} phút`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours} giờ`;
  };

  const filteredCourses = getCoursesWithEnrollment();

  const handleEnroll = async (courseId) => {
    if (!user) {
      navigate('/login', { state: { from: `/courses/${courseId}` } });
      return;
    }
    // Navigate to course detail for enrollment
    navigate(`/courses/${courseId}`);
  };

  const handleContinue = (courseId) => {
    navigate(`/courses/${courseId}/learn`);
  };

  const handleViewCourse = (courseId) => {
    navigate(`/courses/${courseId}`);
  };

  const handleStartFreeTrial = () => {
    if (!user) {
      navigate('/signup');
    } else {
      navigate('/pricing');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCourses();
  };

  return (
    <>
      <CompactSidebar />
      <div className="page-container">
        <div className="page-content">
          {/* Course Hero Section */}
          <CourseHero
                totalCourses={courseStats.totalCourses}
                totalStudents={courseStats.totalStudents}
                completionRate={courseStats.completionRate}
              />

              {/* Search & Category Filter */}
              <section className="category-section-courses">
                <div className="container">
                  {/* Search Bar */}
                  <form onSubmit={handleSearch} className="courses-search-form">
                    <div className="search-input-wrapper">
                      <Search size={18} className="search-icon" />
                      <input
                        type="text"
                        placeholder="Tìm kiếm khóa học..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="courses-search-input"
                      />
                    </div>
                  </form>

                  {/* Category Tabs */}
                  <div className="category-tabs-courses">
                    {categories.map(category => {
                      const Icon = category.icon;
                      return (
                        <button
                          key={category.id}
                          className={`category-tab-course ${categoryFilter === category.id ? 'active' : ''}`}
                          onClick={() => setCategoryFilter(category.id)}
                        >
                          <Icon size={16} className="tab-icon" />
                          <span className="tab-label">{category.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* Courses Grid */}
              <section className="courses-grid-section">
                <div className="container">
                  <div className="section-header-simple">
                    <h2>Khóa học nổi bật</h2>
                    <p>Những khóa học được lựa chọn để đẩy nhanh hành trình của bạn</p>
                  </div>

                  {/* Error State */}
                  {error && (
                    <div className="courses-error-state">
                      <AlertCircle size={48} />
                      <p>{error}</p>
                      <button onClick={fetchCourses} className="btn-retry">
                        Thử lại
                      </button>
                    </div>
                  )}

                  {/* Loading State */}
                  {isLoading && !error && (
                    <div className="loading-state">
                      <Loader2 size={40} className="loading-spinner-icon" />
                      <p>Đang tải khóa học...</p>
                    </div>
                  )}

                  {/* Empty State */}
                  {!isLoading && !error && filteredCourses.length === 0 && (
                    <div className="courses-empty-state">
                      <BookOpen size={48} />
                      <h3>Chưa có khóa học nào</h3>
                      <p>
                        {searchQuery
                          ? `Không tìm thấy khóa học nào với "${searchQuery}"`
                          : 'Các khóa học sẽ được cập nhật sớm'}
                      </p>
                      {searchQuery && (
                        <button
                          onClick={() => { setSearchQuery(''); setCategoryFilter('all'); }}
                          className="btn-clear-search"
                        >
                          Xóa bộ lọc
                        </button>
                      )}
                    </div>
                  )}

                  {/* Courses Grid */}
                  {!isLoading && !error && filteredCourses.length > 0 && (
                    <div className="courses-grid">
                      {filteredCourses.map(course => (
                        <CourseCard
                          key={course.id}
                          course={course}
                          userTier={userCourseTier}
                          onEnroll={handleEnroll}
                          onContinue={handleContinue}
                          onClick={() => handleViewCourse(course.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </section>

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
        </div>
      </div>
    </>
  );
}
