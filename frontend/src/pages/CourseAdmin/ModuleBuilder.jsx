/**
 * ModuleBuilder - Manage Course Modules & Lessons
 * Drag & drop to reorder modules and lessons
 * Uses @dnd-kit for drag and drop functionality
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ArrowLeft,
  Save,
  Plus,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  Video,
  FileText,
  HelpCircle,
  BookOpen,
  Loader2,
  AlertCircle,
  Check,
  X,
  Settings,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { courseService } from '../../services/courseService';
import { lessonService } from '../../services/lessonService';
import { CourseNavigator } from './components';
import './ModuleBuilder.css';

// Sortable Module Item
function SortableModule({ module, isExpanded, onToggle, onEdit, onDelete, onAddLesson, onEditLesson, onDeleteLesson, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={`module-item ${isDragging ? 'dragging' : ''}`}>
      <div className="module-header">
        <div className="module-drag-handle" {...attributes} {...listeners}>
          <GripVertical size={20} />
        </div>
        <div className="module-info" onClick={onToggle}>
          <h3 className="module-title">{module.title}</h3>
          <span className="module-lessons-count">
            {module.lessons?.length || 0} bài học
          </span>
        </div>
        <div className="module-actions">
          <button className="btn-module-action" onClick={onAddLesson} title="Thêm bài học">
            <Plus size={16} />
          </button>
          <button className="btn-module-action" onClick={onEdit} title="Chỉnh sửa">
            <Edit2 size={16} />
          </button>
          <button className="btn-module-action btn-danger" onClick={onDelete} title="Xóa">
            <Trash2 size={16} />
          </button>
          <button className="btn-module-toggle" onClick={onToggle}>
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>
      {isExpanded && (
        <div className="module-lessons">
          {children}
        </div>
      )}
    </div>
  );
}

// Sortable Lesson Item
function SortableLesson({ lesson, onEdit, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getLessonIcon = (type) => {
    switch (type) {
      case 'video': return <Video size={16} />;
      case 'article': return <FileText size={16} />;
      case 'quiz': return <HelpCircle size={16} />;
      default: return <BookOpen size={16} />;
    }
  };

  return (
    <div ref={setNodeRef} style={style} className={`lesson-item ${isDragging ? 'dragging' : ''}`}>
      <div className="lesson-drag-handle" {...attributes} {...listeners}>
        <GripVertical size={16} />
      </div>
      <div className="lesson-icon" onClick={() => onEdit(lesson)}>
        {getLessonIcon(lesson.lesson_type)}
      </div>
      <div className="lesson-info" onClick={() => onEdit(lesson)}>
        <span className="lesson-title">{lesson.title}</span>
        <span className="lesson-meta">
          {lesson.duration_minutes ? `${lesson.duration_minutes} phút` : ''}
          {lesson.is_preview && <span className="preview-tag">Xem trước</span>}
        </span>
      </div>
      <div className="lesson-actions">
        <button className="btn-lesson-action" onClick={() => onEdit(lesson)} title="Chỉnh sửa">
          <Edit2 size={14} />
        </button>
        <button className="btn-lesson-action btn-danger" onClick={() => onDelete(lesson.id)} title="Xóa">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

export default function ModuleBuilder() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const [expandedModules, setExpandedModules] = useState({});
  const [editingModule, setEditingModule] = useState(null);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [showAddModule, setShowAddModule] = useState(false);
  const [courseNavOpen, setCourseNavOpen] = useState(true); // Course Navigator panel

  // Active drag items
  const [activeId, setActiveId] = useState(null);
  const [activeType, setActiveType] = useState(null); // 'module' or 'lesson'

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch course and modules
  const fetchCourse = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const courseData = await courseService.getCourseDetail(courseId, user?.id);
      if (!courseData) {
        setError('Không tìm thấy khóa học');
        return;
      }

      setCourse(courseData);
      setModules(courseData.modules || []);

      // Auto-expand first module
      if (courseData.modules?.length > 0) {
        setExpandedModules({ [courseData.modules[0].id]: true });
      }
    } catch (err) {
      console.error('[ModuleBuilder] Error:', err);
      setError('Không thể tải thông tin khóa học');
    } finally {
      setIsLoading(false);
    }
  }, [courseId, user?.id]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  // Toggle module expansion
  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  // Add new module
  const handleAddModule = async () => {
    if (!newModuleTitle.trim()) return;

    setIsSaving(true);
    try {
      const result = await courseService.createModule({
        course_id: courseId,
        title: newModuleTitle,
      });

      if (!result.success) {
        throw new Error(result.error || 'Không thể tạo chương');
      }

      const newModule = result.data;
      setModules(prev => [...prev, { ...newModule, lessons: [] }]);
      setNewModuleTitle('');
      setShowAddModule(false);
      setExpandedModules(prev => ({ ...prev, [newModule.id]: true }));
      showSuccess('Đã thêm chương mới');
    } catch (err) {
      console.error('[ModuleBuilder] Add module error:', err);
      setError('Không thể thêm chương mới');
    } finally {
      setIsSaving(false);
    }
  };

  // Edit module
  const handleEditModule = async (moduleId, newTitle) => {
    if (!newTitle.trim()) return;

    setIsSaving(true);
    try {
      await courseService.updateModule(moduleId, { title: newTitle });
      setModules(prev =>
        prev.map(m => m.id === moduleId ? { ...m, title: newTitle } : m)
      );
      setEditingModule(null);
      showSuccess('Đã cập nhật chương');
    } catch (err) {
      console.error('[ModuleBuilder] Edit module error:', err);
      setError('Không thể cập nhật chương');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete module
  const handleDeleteModule = async (moduleId) => {
    const module = modules.find(m => m.id === moduleId);
    if (!confirm(`Bạn có chắc muốn xóa chương "${module?.title}"? Tất cả bài học trong chương này cũng sẽ bị xóa.`)) {
      return;
    }

    setIsSaving(true);
    try {
      await courseService.deleteModule(moduleId);
      setModules(prev => prev.filter(m => m.id !== moduleId));
      showSuccess('Đã xóa chương');
    } catch (err) {
      console.error('[ModuleBuilder] Delete module error:', err);
      setError('Không thể xóa chương');
    } finally {
      setIsSaving(false);
    }
  };

  // Navigate to add lesson
  const handleAddLesson = (moduleId) => {
    navigate(`/courses/admin/edit/${courseId}/modules/${moduleId}/lessons/new`);
  };

  // Navigate to edit lesson
  const handleEditLesson = (lesson) => {
    navigate(`/courses/admin/edit/${courseId}/modules/${lesson.module_id}/lessons/${lesson.id}`);
  };

  // Delete lesson
  const handleDeleteLesson = async (moduleId, lessonId) => {
    const module = modules.find(m => m.id === moduleId);
    const lesson = module?.lessons?.find(l => l.id === lessonId);

    if (!confirm(`Bạn có chắc muốn xóa bài học "${lesson?.title}"?`)) {
      return;
    }

    setIsSaving(true);
    try {
      await lessonService.deleteLesson(lessonId);
      setModules(prev =>
        prev.map(m => m.id === moduleId
          ? { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) }
          : m
        )
      );
      showSuccess('Đã xóa bài học');
    } catch (err) {
      console.error('[ModuleBuilder] Delete lesson error:', err);
      setError('Không thể xóa bài học');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle drag start
  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);

    // Determine if dragging a module or lesson
    const isModule = modules.some(m => m.id === active.id);
    setActiveType(isModule ? 'module' : 'lesson');
  };

  // Handle drag end
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      setActiveId(null);
      setActiveType(null);
      return;
    }

    if (activeType === 'module') {
      // Reorder modules
      const oldIndex = modules.findIndex(m => m.id === active.id);
      const newIndex = modules.findIndex(m => m.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newModules = arrayMove(modules, oldIndex, newIndex);
        setModules(newModules);

        // Save new order to backend
        try {
          await courseService.reorderModules(courseId, newModules.map((m, i) => ({
            id: m.id,
            order_index: i,
          })));
        } catch (err) {
          console.error('[ModuleBuilder] Reorder modules error:', err);
          // Revert on error
          fetchCourse();
        }
      }
    } else {
      // Reorder lessons within a module
      // Find which module contains the active lesson
      let sourceModule = null;
      let sourceLesson = null;

      for (const mod of modules) {
        const lesson = mod.lessons?.find(l => l.id === active.id);
        if (lesson) {
          sourceModule = mod;
          sourceLesson = lesson;
          break;
        }
      }

      if (sourceModule && sourceLesson) {
        const oldIndex = sourceModule.lessons.findIndex(l => l.id === active.id);
        const newIndex = sourceModule.lessons.findIndex(l => l.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          const newLessons = arrayMove(sourceModule.lessons, oldIndex, newIndex);

          setModules(prev =>
            prev.map(m => m.id === sourceModule.id
              ? { ...m, lessons: newLessons }
              : m
            )
          );

          // Save new order to backend
          try {
            await lessonService.reorderLessons(sourceModule.id, newLessons.map((l, i) => ({
              id: l.id,
              order_index: i,
            })));
          } catch (err) {
            console.error('[ModuleBuilder] Reorder lessons error:', err);
            fetchCourse();
          }
        }
      }
    }

    setActiveId(null);
    setActiveType(null);
  };

  // Show success message
  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 2000);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="module-builder-page">
        <div className="builder-loading">
          <Loader2 size={48} className="loading-spinner-icon" />
          <p>Đang tải nội dung khóa học...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !course) {
    return (
      <div className="module-builder-page">
        <div className="builder-error">
          <AlertCircle size={48} />
          <h2>{error}</h2>
          <button onClick={() => navigate('/courses/admin')} className="btn-back-admin">
            <ArrowLeft size={18} />
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="module-builder-page">
      {/* Header */}
      <div className="builder-header">
        <button className="btn-back" onClick={() => navigate(`/courses/admin/edit/${courseId}`)}>
          <ArrowLeft size={20} />
          <span>Thông tin khóa học</span>
        </button>

        <div className="header-title">
          <h1 className="builder-title">
            <BookOpen size={28} />
            Nội dung khóa học
          </h1>
          {course && (
            <span className="course-name">{course.title}</span>
          )}
        </div>

        <div className="builder-actions">
          <button
            className="btn-settings"
            onClick={() => navigate(`/courses/admin/edit/${courseId}`)}
          >
            <Settings size={18} />
            Cài đặt
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

      {/* Main Layout with Navigator */}
      <div className="builder-layout-wrapper">
        {/* Course Navigator - Quick switch between courses */}
        <CourseNavigator
          currentCourseId={courseId}
          isOpen={courseNavOpen}
          onToggle={() => setCourseNavOpen(!courseNavOpen)}
          position="left"
        />

        {/* Modules List */}
        <div className="modules-container">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
          <SortableContext
            items={modules.map(m => m.id)}
            strategy={verticalListSortingStrategy}
          >
            {modules.map((module, moduleIndex) => (
              <SortableModule
                key={module.id}
                module={module}
                isExpanded={expandedModules[module.id]}
                onToggle={() => toggleModule(module.id)}
                onEdit={() => setEditingModule(module)}
                onDelete={() => handleDeleteModule(module.id)}
                onAddLesson={() => handleAddLesson(module.id)}
                onEditLesson={handleEditLesson}
                onDeleteLesson={(lessonId) => handleDeleteLesson(module.id, lessonId)}
              >
                {/* Module Edit Form */}
                {editingModule?.id === module.id && (
                  <div className="module-edit-form">
                    <input
                      type="text"
                      className="module-edit-input"
                      defaultValue={module.title}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleEditModule(module.id, e.target.value);
                        } else if (e.key === 'Escape') {
                          setEditingModule(null);
                        }
                      }}
                    />
                    <button
                      className="btn-save-edit"
                      onClick={(e) => {
                        const input = e.target.closest('.module-edit-form').querySelector('input');
                        handleEditModule(module.id, input.value);
                      }}
                    >
                      <Check size={16} />
                    </button>
                    <button className="btn-cancel-edit" onClick={() => setEditingModule(null)}>
                      <X size={16} />
                    </button>
                  </div>
                )}

                {/* Lessons */}
                <SortableContext
                  items={module.lessons?.map(l => l.id) || []}
                  strategy={verticalListSortingStrategy}
                >
                  {module.lessons?.map((lesson) => (
                    <SortableLesson
                      key={lesson.id}
                      lesson={lesson}
                      onEdit={handleEditLesson}
                      onDelete={(lessonId) => handleDeleteLesson(module.id, lessonId)}
                    />
                  ))}
                </SortableContext>

                {/* Empty state for lessons */}
                {(!module.lessons || module.lessons.length === 0) && (
                  <div className="lessons-empty">
                    <p>Chưa có bài học nào</p>
                    <button
                      className="btn-add-first-lesson"
                      onClick={() => handleAddLesson(module.id)}
                    >
                      <Plus size={16} />
                      Thêm bài học đầu tiên
                    </button>
                  </div>
                )}

                {/* Add lesson button */}
                {module.lessons?.length > 0 && (
                  <button
                    className="btn-add-lesson"
                    onClick={() => handleAddLesson(module.id)}
                  >
                    <Plus size={16} />
                    Thêm bài học
                  </button>
                )}
              </SortableModule>
            ))}
          </SortableContext>
        </DndContext>

        {/* Empty state for modules */}
        {modules.length === 0 && (
          <div className="modules-empty">
            <BookOpen size={64} />
            <h3>Chưa có chương nào</h3>
            <p>Bắt đầu tạo chương đầu tiên cho khóa học của bạn</p>
          </div>
        )}

        {/* Add Module Form */}
        {showAddModule ? (
          <div className="add-module-form">
            <input
              type="text"
              className="add-module-input"
              placeholder="Nhập tên chương..."
              value={newModuleTitle}
              onChange={(e) => setNewModuleTitle(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddModule();
                else if (e.key === 'Escape') {
                  setShowAddModule(false);
                  setNewModuleTitle('');
                }
              }}
            />
            <button
              className="btn-confirm-add"
              onClick={handleAddModule}
              disabled={!newModuleTitle.trim() || isSaving}
            >
              {isSaving ? <Loader2 size={16} className="loading-spinner-icon" /> : <Check size={16} />}
            </button>
            <button
              className="btn-cancel-add"
              onClick={() => {
                setShowAddModule(false);
                setNewModuleTitle('');
              }}
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <button className="btn-add-module" onClick={() => setShowAddModule(true)}>
            <Plus size={20} />
            Thêm chương mới
          </button>
        )}
        </div>
      </div>
    </div>
  );
}
