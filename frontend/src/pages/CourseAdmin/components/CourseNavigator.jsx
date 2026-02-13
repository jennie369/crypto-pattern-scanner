/**
 * CourseNavigator Component - Enhanced Version
 * Quick navigation panel for switching between courses and lessons
 * Features: Add lesson, Add module, Drag-drop reorder, Preview course, Collapse/expand
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  ChevronDown,
  BookOpen,
  GraduationCap,
  X,
  Search,
  Loader2,
  Menu,
  Plus,
  Check,
  GripVertical,
  PlayCircle,
  PanelLeft,
  PanelLeftClose,
  Trash2,
} from 'lucide-react';
import { courseService } from '../../../services/courseService';
import { lessonService } from '../../../services/lessonService';
import './CourseNavigator.css';

export default function CourseNavigator({
  currentCourseId,
  currentModuleId,
  currentLessonId,
  isOpen = true,
  onToggle,
  position = 'left', // 'left' or 'floating'
  mode = 'full', // 'simple' = just navigation, 'full' = with add/reorder features
  onDataChange, // Callback when data changes (for parent to refresh)
  showAllCourses = true, // Show all courses or just current course
  onLessonSelect, // Callback for fast lesson switching without page reload (courseId, moduleId, lessonId)
}) {
  const navigate = useNavigate();
  const sidebarContentRef = useRef(null);

  // Course list state (for multi-course navigation)
  const [courses, setCourses] = useState([]);
  const [expandedCourses, setExpandedCourses] = useState({});

  // Single course detail state (modules & lessons)
  const [courseDetail, setCourseDetail] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});

  // Loading states
  const [loading, setLoading] = useState(true);
  const [loadingCourse, setLoadingCourse] = useState(null);

  // Search
  const [searchTerm, setSearchTerm] = useState('');

  // Add module state
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [isCreatingModule, setIsCreatingModule] = useState(false);

  // Drag and drop state
  const [draggingModule, setDraggingModule] = useState(null);
  const [draggingLesson, setDraggingLesson] = useState(null);
  const [dragOverModule, setDragOverModule] = useState(null);
  const [dragOverLesson, setDragOverLesson] = useState(null);
  const [dragInsertPosition, setDragInsertPosition] = useState(null);
  const [isReordering, setIsReordering] = useState(false);

  // Success/Error messages
  const [message, setMessage] = useState({ type: '', text: '' });

  // Show message helper
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 2000);
  };

  // Fetch courses list (for multi-course mode)
  useEffect(() => {
    if (!showAllCourses && currentCourseId) {
      // Single course mode - just load current course
      loadCourseDetail(currentCourseId);
      setLoading(false);
      return;
    }

    const fetchCourses = async () => {
      setLoading(true);
      try {
        const data = await courseService.getAllCoursesForAdmin();
        setCourses(data || []);

        // Auto-expand current course
        if (currentCourseId) {
          setExpandedCourses(prev => ({ ...prev, [currentCourseId]: true }));
          loadCourseDetail(currentCourseId);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [currentCourseId, showAllCourses]);

  // Load modules and lessons for a course
  const loadCourseDetail = useCallback(async (courseId) => {
    if (!courseId) return;

    setLoadingCourse(courseId);
    try {
      const modules = await courseService.getModules(courseId);
      setCourseDetail({ courseId, modules: modules || [] });

      // Auto-expand all modules for current course
      if (modules) {
        const expanded = {};
        modules.forEach(mod => {
          expanded[mod.id] = true;
        });
        setExpandedModules(expanded);
      }

      // Auto-scroll to active lesson
      setTimeout(() => {
        if (currentLessonId && sidebarContentRef.current) {
          const activeLesson = sidebarContentRef.current.querySelector(`[data-lesson-id="${currentLessonId}"]`);
          if (activeLesson) {
            activeLesson.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }, 300);
    } catch (error) {
      console.error('Error loading course modules:', error);
    } finally {
      setLoadingCourse(null);
    }
  }, [currentLessonId]);

  // Refresh current course data
  const refreshCourseData = useCallback(async () => {
    if (currentCourseId) {
      await loadCourseDetail(currentCourseId);
      onDataChange?.();
    }
  }, [currentCourseId, loadCourseDetail, onDataChange]);

  // Toggle course expansion (for multi-course mode)
  const toggleCourse = (courseId) => {
    const isExpanding = !expandedCourses[courseId];
    setExpandedCourses(prev => ({
      ...prev,
      [courseId]: isExpanding
    }));

    if (isExpanding) {
      loadCourseDetail(courseId);
    }
  };

  // Toggle module expansion
  const toggleModuleExpand = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  // Navigate to lesson editor (use callback for fast switch, or navigate for full reload)
  const goToLesson = (courseId, moduleId, lessonId) => {
    // If same course, use callback for instant switch without page reload
    if (onLessonSelect && courseId === currentCourseId) {
      onLessonSelect(courseId, moduleId, lessonId);
    } else {
      // Different course - use full navigation
      navigate(`/courses/admin/edit/${courseId}/modules/${moduleId}/lessons/${lessonId}`);
    }
  };

  // Navigate to course editor
  const goToCourse = (courseId) => {
    navigate(`/courses/admin/edit/${courseId}`);
  };

  // Navigate to modules page
  const goToModule = (courseId) => {
    navigate(`/courses/admin/edit/${courseId}/modules`);
  };

  // Open course preview in new tab
  const previewCourse = (courseId, lessonId = '') => {
    window.open(`/courses/${courseId}/learn?from=editor&lessonId=${lessonId}`, '_blank');
  };

  // =======================
  // ADD MODULE HANDLER
  // =======================
  const handleCreateModule = async () => {
    if (!newModuleTitle.trim() || isCreatingModule || !currentCourseId) return;

    setIsCreatingModule(true);
    try {
      const modules = courseDetail?.modules || [];
      const result = await courseService.createModule({
        course_id: currentCourseId,
        title: newModuleTitle.trim(),
        order_index: modules.length,
      });

      if (result.success && result.data) {
        // Update local state
        setCourseDetail(prev => ({
          ...prev,
          modules: [...(prev?.modules || []), { ...result.data, lessons: [] }]
        }));
        setExpandedModules(prev => ({ ...prev, [result.data.id]: true }));
        setNewModuleTitle('');
        setIsAddingModule(false);
        showMessage('success', 'Đã tạo chương mới');
        onDataChange?.();
      } else {
        showMessage('error', result.error || 'Không thể tạo chương mới');
      }
    } catch (err) {
      console.error('[CourseNavigator] Error creating module:', err);
      showMessage('error', 'Lỗi khi tạo chương mới');
    } finally {
      setIsCreatingModule(false);
    }
  };

  // =======================
  // DRAG AND DROP - MODULES
  // =======================
  const handleModuleDragStart = (e, mod, modIndex) => {
    setDraggingModule({ ...mod, originalIndex: modIndex });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'module', id: mod.id }));
    if (e.target) {
      e.dataTransfer.setDragImage(e.target, 20, 20);
    }
  };

  const handleModuleDragOver = (e, targetMod, targetIndex) => {
    e.preventDefault();
    if (!draggingModule || draggingModule.id === targetMod.id) {
      setDragInsertPosition(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const position = e.clientY < midY ? 'before' : 'after';

    setDragOverModule(targetMod.id);
    setDragInsertPosition({ moduleId: targetMod.id, position, targetIndex });
  };

  const handleModuleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverModule(null);
      setDragInsertPosition(null);
    }
  };

  const handleModuleDrop = async (e) => {
    e.preventDefault();

    if (!draggingModule || !dragInsertPosition || !currentCourseId) {
      handleDragEnd();
      return;
    }

    setIsReordering(true);
    try {
      const modules = courseDetail?.modules || [];
      const currentIndex = draggingModule.originalIndex;
      let targetIndex = dragInsertPosition.targetIndex;

      if (dragInsertPosition.position === 'after') {
        targetIndex = targetIndex + 1;
      }
      if (currentIndex < targetIndex) {
        targetIndex = targetIndex - 1;
      }

      if (currentIndex === targetIndex) {
        handleDragEnd();
        return;
      }

      // Update UI immediately
      const newModules = [...modules];
      const [movedModule] = newModules.splice(currentIndex, 1);
      newModules.splice(targetIndex, 0, movedModule);
      setCourseDetail(prev => ({ ...prev, modules: newModules }));

      // Save to database
      const moduleIds = newModules.map(m => m.id);
      const result = await courseService.reorderModules(currentCourseId, moduleIds);

      if (!result.success) {
        throw new Error(result.error);
      }

      showMessage('success', 'Đã sắp xếp lại chương');
      onDataChange?.();
    } catch (err) {
      console.error('[CourseNavigator] Error reordering modules:', err);
      showMessage('error', 'Không thể sắp xếp lại chương');
      await refreshCourseData();
    } finally {
      handleDragEnd();
      setIsReordering(false);
    }
  };

  const handleModuleDragEnd = () => {
    setDraggingModule(null);
    setDragOverModule(null);
    setDragInsertPosition(null);
  };

  // =======================
  // DRAG AND DROP - LESSONS
  // =======================
  const handleLessonDragStart = (e, lesson, moduleId) => {
    e.stopPropagation();
    setDraggingLesson({ ...lesson, sourceModuleId: moduleId });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'lesson', id: lesson.id, moduleId }));
  };

  const handleLessonDragOver = (e, targetLesson, targetModuleId) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggingLesson && draggingLesson.id !== targetLesson?.id) {
      setDragOverLesson(targetLesson?.id || `module-${targetModuleId}`);
      setDragOverModule(targetModuleId);
    }
  };

  const handleLessonDrop = async (e, targetLesson, targetModuleId, targetIndex) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggingLesson) {
      handleDragEnd();
      return;
    }

    setIsReordering(true);
    try {
      const sourceModuleId = draggingLesson.sourceModuleId;
      const isSameModule = sourceModuleId === targetModuleId;
      const modules = courseDetail?.modules || [];

      if (isSameModule) {
        // Reorder within same module
        const moduleIndex = modules.findIndex(m => m.id === targetModuleId);
        if (moduleIndex === -1) return;

        const newModules = [...modules];
        const lessons = [...(newModules[moduleIndex].lessons || [])];
        const currentLessonIndex = lessons.findIndex(l => l.id === draggingLesson.id);

        if (currentLessonIndex !== -1 && currentLessonIndex !== targetIndex) {
          lessons.splice(currentLessonIndex, 1);
          lessons.splice(targetIndex, 0, draggingLesson);
          newModules[moduleIndex] = { ...newModules[moduleIndex], lessons };

          // Update UI immediately
          setCourseDetail(prev => ({ ...prev, modules: newModules }));

          // Save to database
          const lessonIds = lessons.map(l => l.id);
          const result = await lessonService.reorderLessons(targetModuleId, lessonIds);

          if (!result.success) {
            throw new Error(result.error);
          }
        }
      } else {
        // Move to different module
        const result = await lessonService.moveLesson(draggingLesson.id, targetModuleId);
        if (!result.success) {
          throw new Error(result.error);
        }
        await refreshCourseData();
      }

      showMessage('success', 'Đã sắp xếp lại bài học');
      onDataChange?.();
    } catch (err) {
      console.error('[CourseNavigator] Error reordering lessons:', err);
      showMessage('error', 'Không thể sắp xếp lại bài học');
      await refreshCourseData();
    } finally {
      handleDragEnd();
      setIsReordering(false);
    }
  };

  const handleDragEnd = () => {
    setDraggingModule(null);
    setDraggingLesson(null);
    setDragOverModule(null);
    setDragOverLesson(null);
    setDragInsertPosition(null);
  };

  // =======================
  // DELETE HANDLERS
  // =======================
  const handleDeleteModule = async (moduleId, moduleTitle) => {
    if (!window.confirm(`Bạn có chắc muốn xóa chương "${moduleTitle}"?\n\nTất cả bài học trong chương này cũng sẽ bị xóa.`)) {
      return;
    }

    try {
      const result = await courseService.deleteModule(moduleId);
      if (result.success) {
        // Update local state
        setCourseDetail(prev => ({
          ...prev,
          modules: prev.modules.filter(m => m.id !== moduleId)
        }));
        showMessage('success', 'Đã xóa chương');
        onDataChange?.();
      } else {
        showMessage('error', result.error || 'Không thể xóa chương');
      }
    } catch (err) {
      console.error('[CourseNavigator] Error deleting module:', err);
      showMessage('error', 'Lỗi khi xóa chương');
    }
  };

  const handleDeleteLesson = async (lessonId, lessonTitle, moduleId) => {
    if (!window.confirm(`Bạn có chắc muốn xóa bài học "${lessonTitle}"?`)) {
      return;
    }

    try {
      const result = await lessonService.deleteLesson(lessonId);
      if (result.success) {
        // Update local state
        setCourseDetail(prev => ({
          ...prev,
          modules: prev.modules.map(m =>
            m.id === moduleId
              ? { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) }
              : m
          )
        }));
        showMessage('success', 'Đã xóa bài học');
        onDataChange?.();

        // If deleting current lesson, navigate to module page
        if (lessonId === currentLessonId) {
          navigate(`/courses/admin/edit/${currentCourseId}/modules`);
        }
      } else {
        showMessage('error', result.error || 'Không thể xóa bài học');
      }
    } catch (err) {
      console.error('[CourseNavigator] Error deleting lesson:', err);
      showMessage('error', 'Lỗi khi xóa bài học');
    }
  };

  // Filter courses by search term
  const filteredCourses = courses.filter(course =>
    course.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get modules for current course
  const modules = courseDetail?.modules || [];

  // Toggle button when collapsed
  if (!isOpen) {
    return (
      <button
        className="course-nav-toggle-btn"
        onClick={onToggle}
        title="Mở navigator"
      >
        <Menu size={20} />
      </button>
    );
  }

  // Render module item (used in both modes)
  const renderModule = (mod, modIndex, courseId) => (
    <div
      key={mod.id}
      className={`outline-module ${draggingModule?.id === mod.id ? 'dragging' : ''} ${dragInsertPosition?.moduleId === mod.id ? `insert-${dragInsertPosition.position}` : ''}`}
      draggable={mode === 'full'}
      onDragStart={(e) => mode === 'full' && handleModuleDragStart(e, mod, modIndex)}
      onDragOver={(e) => mode === 'full' && handleModuleDragOver(e, mod, modIndex)}
      onDragLeave={mode === 'full' ? handleModuleDragLeave : undefined}
      onDrop={mode === 'full' ? handleModuleDrop : undefined}
      onDragEnd={mode === 'full' ? handleModuleDragEnd : undefined}
    >
      {/* Module Header */}
      <div
        className={`outline-module-header ${mod.id === currentModuleId ? 'active' : ''} ${expandedModules[mod.id] ? 'expanded' : ''}`}
        onClick={() => toggleModuleExpand(mod.id)}
      >
        {mode === 'full' && (
          <span className="drag-handle" title="Kéo để sắp xếp chương">
            <GripVertical size={12} />
          </span>
        )}
        <ChevronRight size={14} className={`chevron-icon ${expandedModules[mod.id] ? 'expanded' : ''}`} />
        <span className="module-number">{modIndex + 1}</span>
        <span className="module-title">{mod.title}</span>
        <span className="lesson-count">{mod.lessons?.length || 0}</span>
        {mode === 'full' && (
          <button
            className="btn-delete-item"
            title="Xóa chương"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteModule(mod.id, mod.title);
            }}
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>

      {/* Lessons */}
      {expandedModules[mod.id] && (
        <div
          className={`outline-lessons ${dragOverModule === mod.id && draggingLesson ? 'drop-zone-active' : ''}`}
          onDragOver={(e) => {
            if (draggingLesson) {
              e.preventDefault();
              e.stopPropagation();
              setDragOverModule(mod.id);
            }
          }}
          onDrop={(e) => {
            if (draggingLesson) {
              handleLessonDrop(e, null, mod.id, mod.lessons?.length || 0);
            }
          }}
        >
          {mod.lessons?.map((lesson, lessonIndex) => (
            <div
              key={lesson.id}
              data-lesson-id={lesson.id}
              className={`outline-lesson ${lesson.id === currentLessonId ? 'active' : ''} ${draggingLesson?.id === lesson.id ? 'dragging' : ''} ${dragOverLesson === lesson.id ? 'drag-over' : ''}`}
              onDragOver={(e) => mode === 'full' && handleLessonDragOver(e, lesson, mod.id)}
              onDrop={(e) => mode === 'full' && handleLessonDrop(e, lesson, mod.id, lessonIndex)}
              onDragEnd={mode === 'full' ? handleDragEnd : undefined}
              onClick={() => goToLesson(courseId, mod.id, lesson.id)}
            >
              {mode === 'full' && (
                <span
                  className="drag-handle"
                  title="Kéo để sắp xếp bài học"
                  draggable
                  onDragStart={(e) => handleLessonDragStart(e, lesson, mod.id)}
                  onClick={(e) => e.stopPropagation()}
                >
                  <GripVertical size={10} />
                </span>
              )}
              <span className="lesson-number">{modIndex + 1}.{lessonIndex + 1}</span>
              <span className="lesson-title">{lesson.title}</span>
              {mode === 'full' && (
                <button
                  className="btn-delete-item"
                  title="Xóa bài học"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteLesson(lesson.id, lesson.title, mod.id);
                  }}
                >
                  <Trash2 size={10} />
                </button>
              )}
            </div>
          ))}

          {/* Add Lesson Button */}
          {mode === 'full' && (
            <a
              href={`/courses/admin/edit/${courseId}/modules/${mod.id}/lessons/new`}
              className="btn-add-lesson-outline"
              onClick={(e) => e.stopPropagation()}
            >
              <Plus size={14} />
              <span>Thêm bài học</span>
            </a>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className={`course-navigator ${position} ${mode === 'full' ? 'full-mode' : 'simple-mode'}`}>
      {/* Header */}
      <div className="course-nav-header">
        <div className="course-nav-title">
          <BookOpen size={16} />
          <span>Nội dung khóa học</span>
        </div>
        <div className="course-nav-actions">
          {mode === 'full' && currentCourseId && (
            <button
              className="btn-preview-course"
              onClick={() => previewCourse(currentCourseId, currentLessonId)}
              title="Xem trước toàn bộ khóa học (mở tab mới)"
            >
              <PlayCircle size={14} />
            </button>
          )}
          {onToggle && (
            <button
              className="btn-toggle-sidebar"
              onClick={onToggle}
              title={isOpen ? 'Thu gọn' : 'Mở rộng'}
            >
              {isOpen ? <PanelLeftClose size={14} /> : <PanelLeft size={14} />}
            </button>
          )}
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`course-nav-message ${message.type}`}>
          {message.type === 'success' ? <Check size={14} /> : <X size={14} />}
          {message.text}
        </div>
      )}

      {/* Search (for multi-course mode) */}
      {showAllCourses && (
        <div className="course-nav-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Tìm khóa học..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      {/* Content */}
      <div className="course-nav-content" ref={sidebarContentRef}>
        {loading ? (
          <div className="course-nav-loading">
            <Loader2 size={24} className="spin" />
            <span>Đang tải...</span>
          </div>
        ) : showAllCourses ? (
          /* Multi-course mode */
          filteredCourses.length === 0 ? (
            <div className="course-nav-empty">
              <BookOpen size={32} />
              <span>Không có khóa học</span>
            </div>
          ) : (
            filteredCourses.map(course => (
              <div
                key={course.id}
                className={`course-nav-course-item ${currentCourseId === course.id ? 'current' : ''}`}
              >
                {/* Course Header */}
                <div
                  className="course-nav-course-header"
                  onClick={() => toggleCourse(course.id)}
                >
                  <span className="course-nav-expand">
                    {expandedCourses[course.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </span>
                  <GraduationCap size={16} className="course-icon" />
                  <span className="course-nav-course-title" title={course.title}>
                    {course.title}
                  </span>
                  <span className="course-nav-count">{course.lessonCount || 0}</span>
                </div>

                {/* Course Actions & Modules */}
                {expandedCourses[course.id] && (
                  <div className="course-nav-course-content">
                    <button
                      className="btn-edit-course"
                      onClick={(e) => {
                        e.stopPropagation();
                        goToCourse(course.id);
                      }}
                    >
                      Chỉnh sửa khóa học
                    </button>

                    {loadingCourse === course.id ? (
                      <div className="course-nav-loading-inline">
                        <Loader2 size={16} className="spin" />
                        <span>Đang tải...</span>
                      </div>
                    ) : courseDetail?.courseId === course.id && courseDetail.modules?.length > 0 ? (
                      <div className={`outline-list ${isReordering ? 'reordering' : ''}`}>
                        {courseDetail.modules.map((mod, modIndex) => renderModule(mod, modIndex, course.id))}

                        {/* Add Module */}
                        {mode === 'full' && currentCourseId === course.id && renderAddModuleSection()}
                      </div>
                    ) : (
                      <div className="course-nav-no-modules">
                        Chưa có module nào
                        {mode === 'full' && currentCourseId === course.id && renderAddModuleSection()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )
        ) : (
          /* Single-course mode */
          loadingCourse === currentCourseId ? (
            <div className="course-nav-loading">
              <Loader2 size={24} className="spin" />
              <span>Đang tải...</span>
            </div>
          ) : modules.length === 0 ? (
            <div className="course-nav-empty">
              <p>Chưa có chương nào</p>
              {mode === 'full' && (
                <button
                  className="btn-add-module-empty"
                  onClick={() => setIsAddingModule(true)}
                >
                  <Plus size={16} />
                  Thêm chương đầu tiên
                </button>
              )}
            </div>
          ) : (
            <div className={`outline-list ${isReordering ? 'reordering' : ''} ${draggingModule ? 'is-dragging' : ''}`}>
              {modules.map((mod, modIndex) => renderModule(mod, modIndex, currentCourseId))}

              {/* Add Module */}
              {mode === 'full' && renderAddModuleSection()}
            </div>
          )
        )}
      </div>
    </div>
  );

  // Render Add Module Section
  function renderAddModuleSection() {
    if (isAddingModule) {
      return (
        <div className="add-module-form">
          <input
            type="text"
            className="add-module-input"
            placeholder="Tên chương mới..."
            value={newModuleTitle}
            onChange={(e) => setNewModuleTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateModule();
              if (e.key === 'Escape') {
                setIsAddingModule(false);
                setNewModuleTitle('');
              }
            }}
            autoFocus
            disabled={isCreatingModule}
          />
          <div className="add-module-actions">
            <button
              className="btn-confirm-module"
              onClick={handleCreateModule}
              disabled={!newModuleTitle.trim() || isCreatingModule}
            >
              {isCreatingModule ? <Loader2 size={14} className="spin" /> : <Check size={14} />}
            </button>
            <button
              className="btn-cancel-module"
              onClick={() => {
                setIsAddingModule(false);
                setNewModuleTitle('');
              }}
              disabled={isCreatingModule}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      );
    }

    return (
      <button
        className="btn-add-module-outline"
        onClick={() => setIsAddingModule(true)}
      >
        <Plus size={14} />
        <span>Thêm chương mới</span>
      </button>
    );
  }
}
