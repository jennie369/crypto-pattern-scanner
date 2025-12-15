/**
 * Teacher Dashboard - Course Admin
 * Main dashboard for teachers to manage their courses
 * Synced with Mobile App via Supabase
 *
 * Role-based Access Control:
 * - Admin: Full access - can view/edit/delete ALL courses
 * - Teacher: Can create/edit/delete their OWN courses only
 * - Manager: Read-only access - can view all courses but cannot edit/create/delete
 * - User: No access (redirected)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  GraduationCap,
  Clock,
  TrendingUp,
  Award,
  Play,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { courseService } from '../../services/courseService';
import CoursePreviewModal from './CoursePreviewModal';
import './CourseAdmin.css';

export default function CourseAdmin() {
  const navigate = useNavigate();
  const {
    user,
    profile,
    isAdmin,
    isTeacher,
    isManager,
    hasCourseAdminAccess,
    canEditCourse,
    canCreateCourse,
    canDeleteCourse,
  } = useAuth();

  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, published, draft
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    publishedCourses: 0,
    draftCourses: 0,
  });
  const [previewCourseId, setPreviewCourseId] = useState(null);

  // Check access - redirect if user doesn't have course admin access
  useEffect(() => {
    if (profile && !hasCourseAdminAccess()) {
      navigate('/courses');
    }
  }, [profile, hasCourseAdminAccess, navigate]);

  // Fetch courses based on user role
  // Admin & Manager: sees ALL courses (published or not, regardless of creator)
  // Teacher: sees only their own courses
  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let data;
      if (isAdmin() || isManager()) {
        // Admin and Manager can see ALL courses
        data = await courseService.getAllCoursesForAdmin();
      } else if (isTeacher()) {
        // Teacher can only see their own courses
        data = await courseService.getAllCourses(user?.id);
      } else {
        // Regular users shouldn't reach here, but just in case
        data = [];
      }
      setCourses(data);

      // Calculate stats
      const published = data.filter(c => c.is_published).length;
      const totalStudents = data.reduce((sum, c) => sum + (c.studentCount || 0), 0);

      setStats({
        totalCourses: data.length,
        totalStudents,
        publishedCourses: published,
        draftCourses: data.length - published,
      });
    } catch (err) {
      console.error('[CourseAdmin] Error:', err);
      setError('Không thể tải danh sách khóa học');
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, isManager, isTeacher, user?.id]);

  useEffect(() => {
    if (user) {
      fetchCourses();
    }
  }, [fetchCourses, user]);

  // Filter courses
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'published' && course.is_published) ||
      (filterStatus === 'draft' && !course.is_published);
    return matchesSearch && matchesStatus;
  });

  // Toggle publish status
  const handleTogglePublish = async (courseId, currentStatus) => {
    try {
      await courseService.togglePublish(courseId, !currentStatus);
      fetchCourses();
    } catch (err) {
      console.error('[CourseAdmin] Toggle publish error:', err);
      alert('Không thể thay đổi trạng thái khóa học');
    }
  };

  // Delete course
  const handleDeleteCourse = async (courseId, courseTitle) => {
    if (!confirm(`Bạn có chắc muốn xóa khóa học "${courseTitle}"? Hành động này không thể hoàn tác.`)) {
      return;
    }

    try {
      await courseService.deleteCourse(courseId);
      fetchCourses();
    } catch (err) {
      console.error('[CourseAdmin] Delete error:', err);
      alert('Không thể xóa khóa học');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Get tier badge
  const getTierBadge = (tier) => {
    const tiers = {
      FREE: { label: 'Miễn phí', className: 'tier-free' },
      TIER1: { label: 'Tier 1', className: 'tier-1' },
      TIER2: { label: 'Tier 2', className: 'tier-2' },
      TIER3: { label: 'Tier 3', className: 'tier-3' },
    };
    return tiers[tier] || tiers.FREE;
  };

  return (
    <div className="course-admin-page">
      {/* Header */}
      <div className="admin-header">
        <div className="header-content">
          <h1 className="admin-title">
            <GraduationCap size={32} />
            Quản lý khóa học
          </h1>
          <p className="admin-subtitle">
            {isAdmin() && 'Quyền Admin - Quản lý tất cả khóa học'}
            {isTeacher() && 'Quyền Giảng viên - Quản lý khóa học của bạn'}
            {isManager() && 'Quyền Quản lý - Chỉ xem (không có quyền chỉnh sửa)'}
          </p>
        </div>
        {canCreateCourse() && (
          <button
            className="btn-create-course"
            onClick={() => navigate('/courses/admin/create')}
          >
            <Plus size={20} />
            Tạo khóa học mới
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-blue">
            <BookOpen size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.totalCourses}</span>
            <span className="stat-label">Tổng khóa học</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-green">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.totalStudents}</span>
            <span className="stat-label">Học viên</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-gold">
            <Eye size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.publishedCourses}</span>
            <span className="stat-label">Đã xuất bản</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-gray">
            <EyeOff size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.draftCourses}</span>
            <span className="stat-label">Bản nháp</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm khóa học..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            Tất cả ({courses.length})
          </button>
          <button
            className={`filter-tab ${filterStatus === 'published' ? 'active' : ''}`}
            onClick={() => setFilterStatus('published')}
          >
            Đã xuất bản ({stats.publishedCourses})
          </button>
          <button
            className={`filter-tab ${filterStatus === 'draft' ? 'active' : ''}`}
            onClick={() => setFilterStatus('draft')}
          >
            Bản nháp ({stats.draftCourses})
          </button>
        </div>
      </div>

      {/* Course List */}
      <div className="courses-section">
        {isLoading ? (
          <div className="loading-state">
            <Loader2 size={40} className="loading-spinner-icon" />
            <p>Đang tải khóa học...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <AlertCircle size={48} />
            <p>{error}</p>
            <button onClick={fetchCourses} className="btn-retry">
              Thử lại
            </button>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={64} />
            <h3>Chưa có khóa học nào</h3>
            <p>
              {searchQuery
                ? `Không tìm thấy khóa học nào với "${searchQuery}"`
                : isManager()
                  ? 'Chưa có khóa học nào trong hệ thống'
                  : 'Bắt đầu tạo khóa học đầu tiên của bạn'}
            </p>
            {!searchQuery && canCreateCourse() && (
              <button
                className="btn-create-first"
                onClick={() => navigate('/courses/admin/create')}
              >
                <Plus size={20} />
                Tạo khóa học đầu tiên
              </button>
            )}
          </div>
        ) : (
          <div className="courses-table-container">
            <table className="courses-table">
              <thead>
                <tr>
                  <th>Khóa học</th>
                  <th>Tier</th>
                  <th>Học viên</th>
                  <th>Bài học</th>
                  <th>Trạng thái</th>
                  <th>Cập nhật</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course) => {
                  const tierBadge = getTierBadge(course.tier_required);
                  const userCanEdit = canEditCourse(course.created_by);
                  const userCanDelete = canDeleteCourse(course.created_by);
                  return (
                    <tr key={course.id}>
                      <td className="course-cell">
                        <div className="course-info-cell">
                          <img
                            src={course.thumbnail_url || '/images/courses/default.png'}
                            alt={course.title}
                            className="course-thumbnail-small"
                          />
                          <div className="course-details-cell">
                            <span className="course-title-cell">{course.title}</span>
                            <span className="course-category-cell">{course.category || 'Chưa phân loại'}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`tier-badge-small ${tierBadge.className}`}>
                          {tierBadge.label}
                        </span>
                      </td>
                      <td>
                        <div className="student-count-cell">
                          <Users size={16} />
                          <span>{course.studentCount || 0}</span>
                        </div>
                      </td>
                      <td>
                        <div className="lesson-count-cell">
                          <BookOpen size={16} />
                          <span>{course.lessonCount || 0}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${course.is_published ? 'published' : 'draft'}`}>
                          {course.is_published ? 'Đã xuất bản' : 'Bản nháp'}
                        </span>
                      </td>
                      <td className="date-cell">
                        {formatDate(course.updated_at)}
                      </td>
                      <td>
                        <div className="actions-cell">
                          {/* Preview - everyone with access can view */}
                          <button
                            className="btn-action btn-preview"
                            onClick={() => setPreviewCourseId(course.id)}
                            title="Xem trước"
                          >
                            <Play size={16} />
                          </button>

                          {/* Edit - only if user can edit this course */}
                          {userCanEdit && (
                            <button
                              className="btn-action btn-edit"
                              onClick={() => navigate(`/courses/admin/edit/${course.id}`)}
                              title="Chỉnh sửa"
                            >
                              <Edit2 size={16} />
                            </button>
                          )}

                          {/* Toggle publish - only if user can edit */}
                          {userCanEdit && (
                            <button
                              className={`btn-action ${course.is_published ? 'btn-unpublish' : 'btn-publish'}`}
                              onClick={() => handleTogglePublish(course.id, course.is_published)}
                              title={course.is_published ? 'Ẩn khóa học' : 'Xuất bản'}
                            >
                              {course.is_published ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          )}

                          {/* Students management - admin and course owner */}
                          {userCanEdit && (
                            <button
                              className="btn-action btn-students"
                              onClick={() => navigate(`/courses/admin/${course.id}/students`)}
                              title="Quản lý học viên"
                            >
                              <Users size={16} />
                            </button>
                          )}

                          {/* Delete - only if user can delete this course */}
                          {userCanDelete && (
                            <button
                              className="btn-action btn-delete"
                              onClick={() => handleDeleteCourse(course.id, course.title)}
                              title="Xóa"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Course Preview Modal */}
      <CoursePreviewModal
        courseId={previewCourseId}
        isOpen={!!previewCourseId}
        onClose={() => setPreviewCourseId(null)}
      />
    </div>
  );
}
