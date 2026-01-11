/**
 * StudentManagement - Manage Course Enrollments
 * View students, progress, remove enrollments
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Search,
  UserMinus,
  BarChart3,
  Clock,
  Award,
  Mail,
  Download,
  Loader2,
  AlertCircle,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  User,
  Calendar,
  BookOpen,
  Target,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { enrollmentService } from '../../services/enrollmentService';
import { courseService } from '../../services/courseService';
import './StudentManagement.css';

export default function StudentManagement() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, profile, canEditCourse } = useAuth();

  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('enrolled_at'); // enrolled_at, progress, name
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [expandedStudent, setExpandedStudent] = useState(null);

  // Stats
  const [stats, setStats] = useState({
    totalStudents: 0,
    avgProgress: 0,
    completed: 0,
    activeThisWeek: 0,
  });

  // Fetch course and students
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch course
      const courseData = await courseService.getCourseDetail(courseId);
      if (!courseData) {
        setError('Không tìm thấy khóa học');
        return;
      }

      // Check permission - only admin and course owner can manage students
      if (!canEditCourse(courseData.created_by)) {
        setError('Bạn không có quyền quản lý học viên của khóa học này');
        return;
      }

      setCourse(courseData);

      // Fetch enrolled students
      const result = await enrollmentService.getCourseStudents(courseId, { limit: 1000 });
      const enrolledStudents = result.students || [];

      // Transform to expected format
      const transformedStudents = enrolledStudents.map(s => ({
        id: s.id,
        user: {
          full_name: s.name,
          email: s.email,
          avatar_url: s.avatar,
        },
        progress: s.progress || 0,
        enrolled_at: s.enrolledAt,
        last_activity: s.lastAccessedAt,
      }));

      setStudents(transformedStudents);

      // Calculate stats
      if (enrolledStudents?.length > 0) {
        const totalProgress = enrolledStudents.reduce((sum, s) => sum + (s.progress || 0), 0);
        const avgProgress = Math.round(totalProgress / enrolledStudents.length);
        const completed = enrolledStudents.filter(s => s.progress >= 100).length;

        // Active in last 7 days
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const activeThisWeek = enrolledStudents.filter(s =>
          s.last_activity && new Date(s.last_activity) > weekAgo
        ).length;

        setStats({
          totalStudents: enrolledStudents.length,
          avgProgress,
          completed,
          activeThisWeek,
        });
      }
    } catch (err) {
      console.error('[StudentManagement] Error:', err);
      setError('Không thể tải dữ liệu');
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter and sort students
  const filteredStudents = students
    .filter(student => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        student.user?.full_name?.toLowerCase().includes(query) ||
        student.user?.email?.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = (a.user?.full_name || '').localeCompare(b.user?.full_name || '');
          break;
        case 'progress':
          comparison = (a.progress || 0) - (b.progress || 0);
          break;
        case 'enrolled_at':
        default:
          comparison = new Date(a.enrolled_at || 0) - new Date(b.enrolled_at || 0);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Toggle sort
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Toggle select student
  const toggleSelect = (studentId) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  // Select all
  const toggleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id));
    }
  };

  // Remove students
  const handleRemoveStudents = async () => {
    if (selectedStudents.length === 0) return;

    try {
      for (const enrollmentId of selectedStudents) {
        await enrollmentService.unenroll(enrollmentId);
      }

      setStudents(prev => prev.filter(s => !selectedStudents.includes(s.id)));
      setSelectedStudents([]);
      setShowRemoveConfirm(false);
      showSuccess(`Đã xóa ${selectedStudents.length} học viên`);
    } catch (err) {
      console.error('[StudentManagement] Remove error:', err);
      setError('Không thể xóa học viên');
    }
  };

  // Export to CSV
  const handleExport = () => {
    const headers = ['Tên', 'Email', 'Tiến độ (%)', 'Ngày đăng ký', 'Hoạt động cuối'];
    const rows = filteredStudents.map(s => [
      s.user?.full_name || 'N/A',
      s.user?.email || 'N/A',
      s.progress || 0,
      formatDate(s.enrolled_at),
      formatDate(s.last_activity),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `students_${course?.title || 'course'}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
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

  // Show success message
  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Get progress color
  const getProgressColor = (progress) => {
    if (progress >= 100) return '#22C55E';
    if (progress >= 70) return '#FFBD59';
    if (progress >= 30) return '#3B82F6';
    return '#6B7280';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="student-management-page">
        <div className="management-loading">
          <Loader2 size={48} className="loading-spinner-icon" />
          <p>Đang tải danh sách học viên...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="student-management-page">
      {/* Header */}
      <div className="management-header">
        <button className="btn-back" onClick={() => navigate('/courses/admin')}>
          <ArrowLeft size={20} />
          <span>Quay lại</span>
        </button>

        <div className="header-title">
          <h1 className="management-title">
            <Users size={28} />
            Quản lý học viên
          </h1>
          {course && (
            <span className="course-name">{course.title}</span>
          )}
        </div>

        <div className="header-actions">
          <button className="btn-export" onClick={handleExport}>
            <Download size={18} />
            Xuất CSV
          </button>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="message-success">
          <Check size={18} />
          {successMessage}
        </div>
      )}
      {error && (
        <div className="message-error">
          <AlertCircle size={18} />
          {error}
          <button onClick={() => setError(null)}><X size={16} /></button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-blue">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.totalStudents}</span>
            <span className="stat-label">Tổng học viên</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-gold">
            <Target size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.avgProgress}%</span>
            <span className="stat-label">Tiến độ TB</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-green">
            <Award size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.completed}</span>
            <span className="stat-label">Hoàn thành</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-purple">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.activeThisWeek}</span>
            <span className="stat-label">Hoạt động tuần này</span>
          </div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="management-toolbar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Tìm theo tên hoặc email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {selectedStudents.length > 0 && (
          <div className="bulk-actions">
            <span className="selected-count">{selectedStudents.length} đã chọn</span>
            <button
              className="btn-remove-selected"
              onClick={() => setShowRemoveConfirm(true)}
            >
              <UserMinus size={16} />
              Xóa khỏi khóa học
            </button>
          </div>
        )}
      </div>

      {/* Students Table */}
      <div className="students-section">
        {filteredStudents.length === 0 ? (
          <div className="empty-state">
            <Users size={64} />
            <h3>Chưa có học viên nào</h3>
            <p>
              {searchQuery
                ? `Không tìm thấy học viên với "${searchQuery}"`
                : 'Chưa có học viên nào đăng ký khóa học này'}
            </p>
          </div>
        ) : (
          <div className="students-table-container">
            <table className="students-table">
              <thead>
                <tr>
                  <th className="col-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="col-student sortable" onClick={() => handleSort('name')}>
                    Học viên
                    {sortBy === 'name' && (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                  </th>
                  <th className="col-progress sortable" onClick={() => handleSort('progress')}>
                    Tiến độ
                    {sortBy === 'progress' && (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                  </th>
                  <th className="col-enrolled sortable" onClick={() => handleSort('enrolled_at')}>
                    Ngày đăng ký
                    {sortBy === 'enrolled_at' && (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                  </th>
                  <th className="col-activity">Hoạt động cuối</th>
                  <th className="col-actions">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className={selectedStudents.includes(student.id) ? 'selected' : ''}
                  >
                    <td className="col-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => toggleSelect(student.id)}
                      />
                    </td>
                    <td className="col-student">
                      <div className="student-info">
                        <div className="student-avatar">
                          {student.user?.avatar_url ? (
                            <img src={student.user.avatar_url} alt={student.user.full_name} />
                          ) : (
                            <User size={20} />
                          )}
                        </div>
                        <div className="student-details">
                          <span className="student-name">{student.user?.full_name || 'N/A'}</span>
                          <span className="student-email">{student.user?.email || 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="col-progress">
                      <div className="progress-cell">
                        <div className="progress-bar-wrapper">
                          <div
                            className="progress-bar-fill"
                            style={{
                              width: `${student.progress || 0}%`,
                              backgroundColor: getProgressColor(student.progress || 0),
                            }}
                          />
                        </div>
                        <span className="progress-text">{student.progress || 0}%</span>
                      </div>
                    </td>
                    <td className="col-enrolled">
                      <div className="date-cell">
                        <Calendar size={14} />
                        {formatDate(student.enrolled_at)}
                      </div>
                    </td>
                    <td className="col-activity">
                      <div className="date-cell">
                        <Clock size={14} />
                        {formatDate(student.last_activity)}
                      </div>
                    </td>
                    <td className="col-actions">
                      <div className="action-buttons">
                        <button
                          className="btn-action btn-email"
                          onClick={() => window.open(`mailto:${student.user?.email}`)}
                          title="Gửi email"
                        >
                          <Mail size={16} />
                        </button>
                        <button
                          className="btn-action btn-progress"
                          onClick={() => setExpandedStudent(expandedStudent === student.id ? null : student.id)}
                          title="Xem chi tiết"
                        >
                          <BarChart3 size={16} />
                        </button>
                        <button
                          className="btn-action btn-remove"
                          onClick={() => {
                            setSelectedStudents([student.id]);
                            setShowRemoveConfirm(true);
                          }}
                          title="Xóa"
                        >
                          <UserMinus size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Remove Confirmation Modal */}
      {showRemoveConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Xác nhận xóa học viên</h3>
            <p>
              Bạn có chắc muốn xóa {selectedStudents.length} học viên khỏi khóa học?
              Tiến độ học tập của họ cũng sẽ bị xóa.
            </p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowRemoveConfirm(false)}>
                Hủy
              </button>
              <button className="btn-confirm-remove" onClick={handleRemoveStudents}>
                <UserMinus size={16} />
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
