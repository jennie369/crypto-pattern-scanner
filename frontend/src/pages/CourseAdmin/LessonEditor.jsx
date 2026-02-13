/**
 * LessonEditor - Create/Edit Lesson
 * Supports video, article (with HTML import), and quiz types
 * Enhanced with full HTML editing toolbar and copy-paste support
 */

import React, { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Eye,
  Video,
  FileText,
  HelpCircle,
  Upload,
  Code,
  Loader2,
  AlertCircle,
  Check,
  X,
  Link,
  Clock,
  ToggleLeft,
  ToggleRight,
  FileUp,
  Trash2,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Image,
  Quote,
  Copy,
  ClipboardPaste,
  Undo,
  Redo,
  Maximize2,
  Minimize2,
  Table,
  Link2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Paperclip,
  Type,
  Minus,
  Plus,
  Subscript,
  Superscript,
  Strikethrough,
  Highlighter,
  ChevronRight,
  ChevronDown,
  BookOpen,
  PanelLeftClose,
  PanelLeft,
  GripVertical,
  Layers,
  PlayCircle,
  Smartphone,
  Download,
  ShoppingBag,
  Sparkles,
  Globe,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { lessonService } from '../../services/lessonService';
import { courseService } from '../../services/courseService';
import { courseImageService } from '../../services/courseImageService';
import { courseLinks } from '../../utils/linkUtils';
import {
  ImageUploader,
  LessonImageList,
  MediaLibraryModal,
  ImageEditModal,
  DraggableBlockEditor,
  ToolboxSidebar,
  MobilePreviewFrame,
  ProductPickerModal,
  CourseNavigator,
  ImagePositionModal,
} from './components';
import './LessonEditor.css';

const LESSON_TYPES = [
  { value: 'video', label: 'Video', icon: Video, description: 'Bài học dạng video' },
  { value: 'article', label: 'Bài viết', icon: FileText, description: 'Bài viết với HTML' },
  { value: 'quiz', label: 'Bài kiểm tra', icon: HelpCircle, description: 'Quiz trắc nghiệm' },
];

// HTML Toolbar buttons configuration
const HTML_TOOLBAR = [
  { group: 'history', items: [
    { id: 'undo', icon: Undo, title: 'Hoàn tác (Ctrl+Z)', tag: null },
    { id: 'redo', icon: Redo, title: 'Làm lại (Ctrl+Y)', tag: null },
  ]},
  { group: 'headings', items: [
    { id: 'h1', icon: Heading1, title: 'Tiêu đề 1', tag: '<h1>', closeTag: '</h1>' },
    { id: 'h2', icon: Heading2, title: 'Tiêu đề 2', tag: '<h2>', closeTag: '</h2>' },
    { id: 'h3', icon: Heading3, title: 'Tiêu đề 3', tag: '<h3>', closeTag: '</h3>' },
  ]},
  { group: 'fontSize', items: [
    { id: 'fontSmall', icon: Minus, title: 'Chữ nhỏ (12px)', tag: '<span style="font-size: 12px;">', closeTag: '</span>' },
    { id: 'fontNormal', icon: Type, title: 'Chữ thường (16px)', tag: '<span style="font-size: 16px;">', closeTag: '</span>' },
    { id: 'fontLarge', icon: Plus, title: 'Chữ lớn (20px)', tag: '<span style="font-size: 20px;">', closeTag: '</span>' },
  ]},
  { group: 'format', items: [
    { id: 'bold', icon: Bold, title: 'In đậm', tag: '<strong>', closeTag: '</strong>' },
    { id: 'italic', icon: Italic, title: 'In nghiêng', tag: '<em>', closeTag: '</em>' },
    { id: 'underline', icon: Underline, title: 'Gạch chân', tag: '<u>', closeTag: '</u>' },
    { id: 'strikethrough', icon: Strikethrough, title: 'Gạch ngang', tag: '<s>', closeTag: '</s>' },
  ]},
  { group: 'script', items: [
    { id: 'highlight', icon: Highlighter, title: 'Highlight', tag: '<mark>', closeTag: '</mark>' },
    { id: 'subscript', icon: Subscript, title: 'Chỉ số dưới', tag: '<sub>', closeTag: '</sub>' },
    { id: 'superscript', icon: Superscript, title: 'Chỉ số trên', tag: '<sup>', closeTag: '</sup>' },
  ]},
  { group: 'lists', items: [
    { id: 'ul', icon: List, title: 'Danh sách', tag: '<ul>\n  <li>', closeTag: '</li>\n</ul>' },
    { id: 'ol', icon: ListOrdered, title: 'Danh sách có số', tag: '<ol>\n  <li>', closeTag: '</li>\n</ol>' },
  ]},
  { group: 'blocks', items: [
    { id: 'quote', icon: Quote, title: 'Trích dẫn', tag: '<blockquote>', closeTag: '</blockquote>' },
    { id: 'code', icon: Code, title: 'Code', tag: '<pre><code>', closeTag: '</code></pre>' },
  ]},
  { group: 'media', items: [
    { id: 'image', icon: Image, title: 'Hình ảnh', tag: '<img src="', closeTag: '" alt="" style="width: 100%; max-width: 800px; height: auto; display: block; margin-top: 16px; margin-left: auto; margin-right: auto; margin-bottom: 40px; padding: 0; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.2);" />' },
    { id: 'link', icon: Link2, title: 'Liên kết', tag: '<a href="', closeTag: '">Link</a>' },
    { id: 'table', icon: Table, title: 'Bảng', tag: '<table>\n  <tr>\n    <th>Cột 1</th>\n    <th>Cột 2</th>\n  </tr>\n  <tr>\n    <td>', closeTag: '</td>\n    <td></td>\n  </tr>\n</table>' },
  ]},
  { group: 'align', items: [
    { id: 'alignLeft', icon: AlignLeft, title: 'Căn trái', tag: '<div style="text-align: left;">', closeTag: '</div>' },
    { id: 'alignCenter', icon: AlignCenter, title: 'Căn giữa', tag: '<div style="text-align: center;">', closeTag: '</div>' },
    { id: 'alignRight', icon: AlignRight, title: 'Căn phải', tag: '<div style="text-align: right;">', closeTag: '</div>' },
  ]},
];

// Editor Tabs
const EDITOR_TABS = [
  { id: 'content', label: 'Nội dung', icon: FileText },
  { id: 'images', label: 'Hình ảnh', icon: Image },
  { id: 'attachments', label: 'Tài liệu', icon: Paperclip },
];

export default function LessonEditor() {
  const { courseId, moduleId: urlModuleId, lessonId: urlLessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Active lesson state - allows fast switching without full page reload
  const [activeModuleId, setActiveModuleId] = useState(urlModuleId);
  const [activeLessonId, setActiveLessonId] = useState(urlLessonId);

  // Sync active IDs with URL when URL changes (e.g., browser back/forward)
  useEffect(() => {
    setActiveModuleId(urlModuleId);
    setActiveLessonId(urlLessonId);
  }, [urlModuleId, urlLessonId]);

  // Use active IDs for editing, fall back to URL
  const moduleId = activeModuleId || urlModuleId;
  const lessonId = activeLessonId || urlLessonId;

  const isEditing = lessonId && lessonId !== 'new';
  const fileInputRef = useRef(null);
  const htmlInputRef = useRef(null);
  const textareaRef = useRef(null);
  const wysiwygEditorRef = useRef(null);
  const wysiwygEditorRef2 = useRef(null); // Second ref for non-fullscreen editor
  const isInternalEditRef = useRef(false); // Flag to prevent scroll jumps on internal edits
  const lastContentFromEditorRef = useRef(''); // Track content from editor to prevent unnecessary re-renders
  const sidebarContentRef = useRef(null); // Ref for sidebar scroll container
  const sidebarContentRef2 = useRef(null); // Ref for fullscreen sidebar scroll container

  // Refs for undo/redo functionality
  const lastSavedContentRef = useRef('');
  const undoDebounceRef = useRef(null);
  const skipNextUndoSaveRef = useRef(false); // Flag to skip debounced save after forceSaveToUndo

  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [module, setModule] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    lesson_type: 'video',
    video_url: '',
    content_html: '',
    duration_minutes: 0,
    is_preview: false,
    order_index: 0,
  });

  const [errors, setErrors] = useState({});
  const [showHtmlPreview, setShowHtmlPreview] = useState(true); // Default to preview mode (WYSIWYG editor)
  const [blockEditMode, setBlockEditMode] = useState(false); // Toggle between WYSIWYG and Block drag-drop mode
  const [iframePreviewMode, setIframePreviewMode] = useState(false); // Show exact browser preview via iframe
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false); // Show mobile device preview
  const [toolboxCollapsed, setToolboxCollapsed] = useState(false); // Toolbox sidebar collapsed state

  // Resizable columns state
  const [columnWidths, setColumnWidths] = useState({
    outline: 280,      // Course outline sidebar
    toolbox: 240,      // Toolbox sidebar
    mobilePreview: 380, // Mobile preview panel (reduced for less padding)
    imagePanel: 300,   // Image upload panel
  });
  const [resizingColumn, setResizingColumn] = useState(null);
  const resizeStartX = useRef(0);
  const resizeStartWidth = useRef(0);

  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Autosave state
  const [autoSaveStatus, setAutoSaveStatus] = useState('idle'); // idle | saving | saved | error
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const autoSaveTimerRef = useRef(null);
  const inputSyncTimerRef = useRef(null); // Timer for debounced input sync to state
  const formDataRef = useRef(formData);
  formDataRef.current = formData; // Keep ref in sync with state for callback refs

  // Callback ref for fullscreen editor - sets content when editor mounts
  const setWysiwygEditorRef = useCallback((node) => {
    wysiwygEditorRef.current = node;
    if (node && formDataRef.current?.content_html) {
      // Set content immediately when editor mounts
      if (node.innerHTML !== formDataRef.current.content_html) {
        node.innerHTML = formDataRef.current.content_html;
      }
    }
  }, []);

  // Callback ref for non-fullscreen editor - sets content when editor mounts
  const setWysiwygEditorRef2 = useCallback((node) => {
    wysiwygEditorRef2.current = node;
    if (node && formDataRef.current?.content_html) {
      // Set content immediately when editor mounts
      if (node.innerHTML !== formDataRef.current.content_html) {
        node.innerHTML = formDataRef.current.content_html;
      }
    }
  }, []);

  // Track if we already created a lesson (prevent duplicates)
  const [createdLessonId, setCreatedLessonId] = useState(null);

  // Tab and Image state
  const [activeTab, setActiveTab] = useState('content');
  const [lessonImages, setLessonImages] = useState([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [mediaLibraryVisible, setMediaLibraryVisible] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [imagePositionModalOpen, setImagePositionModalOpen] = useState(false);
  const [selectedImageElement, setSelectedImageElement] = useState(null);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [copiedImageId, setCopiedImageId] = useState(null);
  const [copiedLinkId, setCopiedLinkId] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null); // For right sidebar image zoom
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isDraggingOverEditor, setIsDraggingOverEditor] = useState(false);
  const draggingInternalElementRef = useRef(null); // Track element being dragged within editor
  const selectedElementPathRef = useRef(null); // Store path to selected element (survives re-renders)

  // Context menu state for right-click copy/duplicate
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, element: null });
  const [copiedElement, setCopiedElement] = useState(null); // Stores copied HTML with styles

  // Multi-select state for drag selection
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectionRect, setSelectionRect] = useState(null); // { startX, startY, endX, endY }
  const [selectedElements, setSelectedElements] = useState([]); // Array of selected element paths
  const selectionStartRef = useRef(null);

  // ═══ ELEMENT RESIZE STATE ═══
  // Allows resizing selected components by dragging handles
  const [isResizingElement, setIsResizingElement] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null); // 'nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'
  const resizeElementRef = useRef(null); // Element being resized
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const [resizeOverlay, setResizeOverlay] = useState(null); // { x, y, width, height } for showing resize handles

  // Sidebar navigation state - list of modules and lessons
  const [courseOutline, setCourseOutline] = useState([]);
  const [outlineLoading, setOutlineLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [courseNavOpen, setCourseNavOpen] = useState(true); // Course Navigator panel
  const [imageSortOrder, setImageSortOrder] = useState('newest'); // newest | oldest | name

  // Drag and drop state for reordering
  const [draggingModule, setDraggingModule] = useState(null);
  const [draggingLesson, setDraggingLesson] = useState(null);
  const [dragOverModule, setDragOverModule] = useState(null);
  const [dragOverLesson, setDragOverLesson] = useState(null);
  const [isReordering, setIsReordering] = useState(false);

  // Expanded modules state for toggle
  const [expandedModules, setExpandedModules] = useState({});

  // New module creation state
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [isCreatingModule, setIsCreatingModule] = useState(false);

  // ═══════════════════════════════════════════════════════════════════
  // SANITIZE HTML FOR EDITOR DISPLAY
  // Removes/modifies problematic CSS that doesn't work in containers
  // Also removes decorative elements like .background-container, .orb
  // ═══════════════════════════════════════════════════════════════════
  const sanitizeHtmlForEditor = useCallback((html) => {
    // Don't modify HTML - just return as-is
    // CSS overrides in LessonEditor.css handle display issues
    return html;
  }, []);

  // Fetch lesson for editing
  const fetchLesson = useCallback(async () => {
    if (!isEditing) {
      // Fetch module info for new lesson
      try {
        const courseData = await courseService.getCourseDetail(courseId);
        const moduleData = courseData?.modules?.find(m => m.id === moduleId);
        setModule(moduleData);
        if (moduleData?.lessons) {
          setFormData(prev => ({ ...prev, order_index: moduleData.lessons.length }));
        }
      } catch (err) {
        console.error('[LessonEditor] Error fetching module:', err);
      }
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const lesson = await lessonService.getLesson(lessonId);
      if (!lesson) {
        setError('Không tìm thấy bài học');
        return;
      }

      // Map from DB field names - check ALL possible content columns
      const rawHtmlContent =
        lesson.content ||
        lesson.content_html ||
        lesson.html_content ||
        lesson.article_content ||
        lesson.parsed_content ||
        '';

      // Sanitize HTML for editor display (fix position:fixed, orbs, etc.)
      const htmlContent = sanitizeHtmlForEditor(rawHtmlContent);

      setFormData({
        title: lesson.title || '',
        lesson_type: lesson.type || lesson.lesson_type || lesson.content_type || 'video',
        video_url: lesson.video_url || '',
        content_html: htmlContent,
        duration_minutes: lesson.duration_minutes || 0,
        is_preview: lesson.is_preview || lesson.is_free_preview || false,
        order_index: lesson.order_index || 0,
      });

      // Fetch module info
      const courseData = await courseService.getCourseDetail(courseId);
      const moduleData = courseData?.modules?.find(m => m.id === moduleId);
      setModule(moduleData);
    } catch (err) {
      console.error('[LessonEditor] Error:', err);
      setError('Không thể tải thông tin bài học');
    } finally {
      setIsLoading(false);
    }
  }, [courseId, moduleId, lessonId, isEditing, sanitizeHtmlForEditor]);

  useEffect(() => {
    fetchLesson();
  }, [fetchLesson]);

  // Reset refs when lesson changes (navigation to new lesson)
  // This ensures the content sync works correctly for the new lesson
  useEffect(() => {
    lastContentFromEditorRef.current = '';
    lastSavedContentRef.current = '';
    isInternalEditRef.current = false;
  }, [lessonId]);

  // Initialize lastSavedContentRef when content is loaded
  useEffect(() => {
    if (formData.content_html && lastSavedContentRef.current === '') {
      lastSavedContentRef.current = formData.content_html;
    }
  }, [formData.content_html]);

  // Sync WYSIWYG editor content without causing scroll jumps
  // Only update innerHTML when content changes from external source (not user typing)
  // Use useLayoutEffect to sync content immediately before browser paint (prevents blank flash)
  // CRITICAL: This is the ONLY place where innerHTML should be set (no dangerouslySetInnerHTML)
  useLayoutEffect(() => {
    // Handle both fullscreen and non-fullscreen editors
    const editors = [wysiwygEditorRef.current, wysiwygEditorRef2.current].filter(Boolean);
    if (editors.length === 0) return;

    // Skip if this is an internal edit (user typing/dropping/deleting)
    // IMPORTANT: Don't reset the flag here - let it persist until content is actually different
    if (isInternalEditRef.current) {
      // Check if lastContentFromEditorRef matches - if so, keep skipping
      if (lastContentFromEditorRef.current === formData.content_html) {
        // Content matches what we captured, safe to skip but DON'T reset flag yet
        // The flag will be reset when we need to sync external changes
        return;
      }
      // Content is different from what we captured - this is an external change
      // Reset flag and proceed to sync
      isInternalEditRef.current = false;
    }

    // Skip if content matches what we last synced (but NOT on initial render - empty check)
    // Also check if editors already have this content (prevents unnecessary DOM updates)
    const contentToSet = formData.content_html || '';

    editors.forEach(editor => {
      // Skip if content is exactly the same as what's already in editor
      if (editor.innerHTML === contentToSet) {
        // Content already matches - just update ref
        lastContentFromEditorRef.current = contentToSet;
        return;
      }

      // Content is different - need to update editor
      // Save scroll positions before modifying DOM
      const scrollTop = editor.scrollTop;
      const scrollLeft = editor.scrollLeft;
      const parentScrollTop = editor.parentElement?.scrollTop || 0;
      const windowScrollY = window.scrollY;
      const windowScrollX = window.scrollX;

      // Update content
      editor.innerHTML = contentToSet;

      // Restore scroll position immediately and after next paint
      editor.scrollTop = scrollTop;
      editor.scrollLeft = scrollLeft;
      if (editor.parentElement) {
        editor.parentElement.scrollTop = parentScrollTop;
      }

      requestAnimationFrame(() => {
        editor.scrollTop = scrollTop;
        editor.scrollLeft = scrollLeft;
        if (editor.parentElement) {
          editor.parentElement.scrollTop = parentScrollTop;
        }
        window.scrollTo(windowScrollX, windowScrollY);
      });
    });

    // Update lastContentFromEditorRef to prevent re-syncing the same content
    lastContentFromEditorRef.current = contentToSet;
  }, [formData.content_html, showHtmlPreview, blockEditMode, isFullscreen]);

  // Set visual styles for draggable elements (event delegation handles the actual drag)
  // This runs when content changes to apply cursor:grab to images
  useEffect(() => {
    const editors = [wysiwygEditorRef.current, wysiwygEditorRef2.current].filter(Boolean);

    editors.forEach(editor => {
      if (!editor) return;
      // Set cursor style for images to indicate they're draggable
      editor.querySelectorAll('img').forEach(img => {
        img.style.cursor = 'grab';
      });
    });
  }, [formData.content_html, showHtmlPreview]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (undoDebounceRef.current) {
        clearTimeout(undoDebounceRef.current);
      }
      if (inputSyncTimerRef.current) {
        clearTimeout(inputSyncTimerRef.current);
      }
    };
  }, []);

  // Fetch course outline for sidebar navigation
  const fetchCourseOutline = useCallback(async () => {
    if (!courseId) return;

    setOutlineLoading(true);
    try {
      // getModules already returns modules with lessons included
      const modules = await courseService.getModules(courseId);
      setCourseOutline(modules || []);
    } catch (err) {
      console.error('[LessonEditor] Error fetching outline:', err);
    } finally {
      setOutlineLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourseOutline();
  }, [fetchCourseOutline]);

  // Fast lesson switching - updates state and URL without full page reload
  const handleLessonSelect = useCallback(async (newCourseId, newModuleId, newLessonId) => {
    // Skip if same lesson
    if (newLessonId === lessonId && newModuleId === moduleId) return;

    // Update URL without triggering navigation (keeps browser history)
    const newUrl = `/courses/admin/edit/${newCourseId}/modules/${newModuleId}/lessons/${newLessonId}`;
    window.history.pushState({}, '', newUrl);

    // Update active IDs - this triggers fetchLesson via useEffect
    setActiveModuleId(newModuleId);
    setActiveLessonId(newLessonId);

    // Reset editor state for new lesson
    lastContentFromEditorRef.current = '';
    lastSavedContentRef.current = '';
    isInternalEditRef.current = false;
    setUndoStack([]);
    setRedoStack([]);
    setHasUnsavedChanges(false);
    setAutoSaveStatus('idle');
  }, [lessonId, moduleId]);

  // Initialize expanded modules when outline loads (expand all by default)
  useEffect(() => {
    if (courseOutline.length > 0 && Object.keys(expandedModules).length === 0) {
      const initialExpanded = {};
      courseOutline.forEach(mod => {
        initialExpanded[mod.id] = true; // All expanded by default
      });
      setExpandedModules(initialExpanded);
    }
  }, [courseOutline]);

  // Auto-scroll to active lesson when outline loads or lesson changes
  useEffect(() => {
    if (!lessonId || courseOutline.length === 0 || Object.keys(expandedModules).length === 0) return;

    // Wait for DOM to update after expandedModules are set
    const scrollTimer = setTimeout(() => {
      // Scroll both sidebars (normal and fullscreen)
      [sidebarContentRef.current, sidebarContentRef2.current].forEach(container => {
        if (!container) return;

        // Find active lesson within this container
        const activeLesson = container.querySelector(`[data-lesson-id="${lessonId}"]`);
        if (!activeLesson) return;

        // Use getBoundingClientRect for accurate position calculation
        const containerRect = container.getBoundingClientRect();
        const lessonRect = activeLesson.getBoundingClientRect();

        // Calculate how far the lesson is from the center of the container
        const lessonCenterY = lessonRect.top + lessonRect.height / 2;
        const containerCenterY = containerRect.top + containerRect.height / 2;
        const scrollOffset = lessonCenterY - containerCenterY;

        // Apply scroll
        container.scrollTop += scrollOffset;
      });
    }, 500);

    return () => clearTimeout(scrollTimer);
  }, [lessonId, courseOutline, expandedModules]);

  // Toggle module expand/collapse
  const toggleModuleExpand = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  // =======================
  // DRAG AND DROP HANDLERS
  // =======================

  // Handle create new module/chapter
  const handleCreateModule = async () => {
    if (!newModuleTitle.trim() || isCreatingModule) return;

    setIsCreatingModule(true);
    try {
      const result = await courseService.createModule({
        course_id: courseId,
        title: newModuleTitle.trim(),
        order_index: courseOutline.length,
      });

      if (result.success && result.data) {
        // Add new module to outline
        setCourseOutline(prev => [...prev, { ...result.data, lessons: [] }]);
        // Expand the new module
        setExpandedModules(prev => ({ ...prev, [result.data.id]: true }));
        // Reset form
        setNewModuleTitle('');
        setIsAddingModule(false);
        setSuccessMessage('Đã tạo chương mới');
        setTimeout(() => setSuccessMessage(''), 2000);
      } else {
        setError(result.error || 'Không thể tạo chương mới');
      }
    } catch (err) {
      console.error('[LessonEditor] Error creating module:', err);
      setError('Lỗi khi tạo chương mới');
    } finally {
      setIsCreatingModule(false);
    }
  };

  // Track drag position for insert indicator
  const [dragInsertPosition, setDragInsertPosition] = useState(null); // { moduleId, position: 'before' | 'after' }

  // Handle module drag start
  const handleModuleDragStart = (e, mod, modIndex) => {
    console.log('[DragDrop] Module drag start:', mod.id);
    setDraggingModule({ ...mod, originalIndex: modIndex });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'module', id: mod.id }));
    // Set drag image
    if (e.target) {
      e.dataTransfer.setDragImage(e.target, 20, 20);
    }
  };

  // Handle module drag over - determine insert position
  const handleModuleDragOver = (e, targetMod, targetIndex) => {
    e.preventDefault();
    if (!draggingModule || draggingModule.id === targetMod.id) {
      setDragInsertPosition(null);
      return;
    }

    // Determine if dropping before or after based on mouse Y position
    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const position = e.clientY < midY ? 'before' : 'after';

    setDragOverModule(targetMod.id);
    setDragInsertPosition({ moduleId: targetMod.id, position, targetIndex });
  };

  // Handle module drag leave
  const handleModuleDragLeave = (e) => {
    // Only clear if leaving the module entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverModule(null);
      setDragInsertPosition(null);
    }
  };

  // Handle module drop - reorder modules
  const handleModuleDrop = async (e) => {
    e.preventDefault();
    console.log('[DragDrop] Module drop, draggingModule:', draggingModule?.id, 'insertPosition:', dragInsertPosition);

    if (!draggingModule || !dragInsertPosition) {
      setDraggingModule(null);
      setDragOverModule(null);
      setDragInsertPosition(null);
      return;
    }

    setIsReordering(true);
    try {
      const currentIndex = draggingModule.originalIndex;
      let targetIndex = dragInsertPosition.targetIndex;

      // Adjust target index based on position
      if (dragInsertPosition.position === 'after') {
        targetIndex = targetIndex + 1;
      }

      // Adjust if moving from before to after
      if (currentIndex < targetIndex) {
        targetIndex = targetIndex - 1;
      }

      if (currentIndex === targetIndex) {
        console.log('[DragDrop] Same position, no change');
        return;
      }

      // Calculate new order
      const newOutline = [...courseOutline];
      const [movedModule] = newOutline.splice(currentIndex, 1);
      newOutline.splice(targetIndex, 0, movedModule);

      console.log('[DragDrop] Reordering from', currentIndex, 'to', targetIndex);

      // Update UI immediately
      setCourseOutline(newOutline);

      // Save to database
      const moduleIds = newOutline.map(m => m.id);
      const result = await courseService.reorderModules(courseId, moduleIds);

      if (!result.success) {
        throw new Error(result.error);
      }

      setSuccessMessage('Đã sắp xếp lại chương');
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (err) {
      console.error('[LessonEditor] Error reordering modules:', err);
      setError('Không thể sắp xếp lại chương');
      fetchCourseOutline();
    } finally {
      setDraggingModule(null);
      setDragOverModule(null);
      setDragInsertPosition(null);
      setIsReordering(false);
    }
  };

  // Handle drag end (cleanup)
  const handleModuleDragEnd = () => {
    console.log('[DragDrop] Module drag end');
    setDraggingModule(null);
    setDragOverModule(null);
    setDragInsertPosition(null);
  };

  // Handle lesson drag start
  const handleLessonDragStart = (e, lesson, moduleId) => {
    e.stopPropagation();
    setDraggingLesson({ ...lesson, sourceModuleId: moduleId });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'lesson', id: lesson.id, moduleId }));
  };

  // Handle lesson drag over
  const handleLessonDragOver = (e, targetLesson, targetModuleId) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggingLesson && draggingLesson.id !== targetLesson?.id) {
      setDragOverLesson(targetLesson?.id || `module-${targetModuleId}`);
      setDragOverModule(targetModuleId);
    }
  };

  // Handle lesson drop - reorder or move lessons
  const handleLessonDrop = async (e, targetLesson, targetModuleId, targetIndex) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggingLesson) {
      setDraggingLesson(null);
      setDragOverLesson(null);
      setDragOverModule(null);
      return;
    }

    setIsReordering(true);
    try {
      const sourceModuleId = draggingLesson.sourceModuleId;
      const isSameModule = sourceModuleId === targetModuleId;

      if (isSameModule) {
        // Reorder within same module
        const moduleIndex = courseOutline.findIndex(m => m.id === targetModuleId);
        if (moduleIndex === -1) return;

        const newOutline = [...courseOutline];
        const lessons = [...(newOutline[moduleIndex].lessons || [])];
        const currentLessonIndex = lessons.findIndex(l => l.id === draggingLesson.id);

        if (currentLessonIndex !== -1 && currentLessonIndex !== targetIndex) {
          lessons.splice(currentLessonIndex, 1);
          lessons.splice(targetIndex, 0, draggingLesson);
          newOutline[moduleIndex] = { ...newOutline[moduleIndex], lessons };

          // Update UI immediately
          setCourseOutline(newOutline);

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
        // Refresh to get updated structure
        await fetchCourseOutline();
      }

      setSuccessMessage('Đã sắp xếp lại bài học');
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (err) {
      console.error('[LessonEditor] Error reordering lessons:', err);
      setError('Không thể sắp xếp lại bài học');
      // Refresh to get correct order
      fetchCourseOutline();
    } finally {
      setDraggingLesson(null);
      setDragOverLesson(null);
      setDragOverModule(null);
      setIsReordering(false);
    }
  };

  // Handle drag end (cleanup) - for lessons
  const handleDragEnd = () => {
    setDraggingModule(null);
    setDraggingLesson(null);
    setDragOverModule(null);
    setDragOverLesson(null);
    setDragInsertPosition(null);
  };

  // Fetch ALL user images (not just lesson-specific)
  const fetchLessonImages = useCallback(async () => {
    setImagesLoading(true);
    try {
      // Fetch all images uploaded by current user
      const { data: images } = await courseImageService.getMyImages({ limit: 200 });
      setLessonImages(images || []);
    } catch (err) {
      console.error('[LessonEditor] Error fetching images:', err);
    } finally {
      setImagesLoading(false);
    }
  }, []);

  // Fetch images when editing a lesson (images panel always visible in right sidebar)
  useEffect(() => {
    if (lessonId && lessonId !== 'new' && lessonImages.length === 0) {
      fetchLessonImages();
    }
  }, [lessonId, fetchLessonImages, lessonImages.length]);

  // Image handlers
  const handleImageUploadComplete = (newImage) => {
    setLessonImages((prev) => [...prev, newImage]);
  };

  const handleUpdateImage = async (updatedImage) => {
    setLessonImages((prev) =>
      prev.map((img) => (img.id === updatedImage.id ? updatedImage : img))
    );
    setEditingImage(null);
  };

  const handleDeleteImage = async (imageId) => {
    try {
      const { error } = await courseImageService.delete(imageId);
      if (error) throw error;
      setLessonImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (err) {
      console.error('[LessonEditor] Delete image error:', err);
      setError('Không thể xóa hình ảnh');
    }
  };

  const handleReorderImages = async (reorderedImages) => {
    setLessonImages(reorderedImages);
    try {
      await courseImageService.updateOrder(reorderedImages);
    } catch (err) {
      console.error('[LessonEditor] Reorder error:', err);
    }
  };

  const handleSelectFromLibrary = (image) => {
    // Copy the selected image URL to clipboard
    navigator.clipboard.writeText(image.image_url);
    setSuccessMessage('Đã copy URL hình ảnh');
    setTimeout(() => setSuccessMessage(''), 2000);
    setMediaLibraryVisible(false);
  };

  // Sort images based on selected order
  const getSortedImages = () => {
    const sorted = [...lessonImages];
    switch (imageSortOrder) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      case 'name':
        return sorted.sort((a, b) => (a.position_id || '').localeCompare(b.position_id || ''));
      default:
        return sorted;
    }
  };

  const sortedImages = getSortedImages();

  // Save to undo stack
  const saveToUndo = useCallback(() => {
    // Skip if forceSaveToUndo already saved for this change
    if (skipNextUndoSaveRef.current) {
      skipNextUndoSaveRef.current = false;
      return;
    }

    const currentContent = formData.content_html;
    // Only save if content actually changed from last saved
    // AND lastSavedContentRef is not empty (prevents saving empty state on initial load)
    if (currentContent && lastSavedContentRef.current && currentContent !== lastSavedContentRef.current) {
      setUndoStack(prev => [...prev.slice(-19), lastSavedContentRef.current]);
      setRedoStack([]);
      lastSavedContentRef.current = currentContent;
    } else if (currentContent && !lastSavedContentRef.current) {
      // Initialize lastSavedContentRef if it's empty (first edit after load)
      lastSavedContentRef.current = currentContent;
    }
  }, [formData.content_html]);

  // Debounced save to undo - saves after 500ms of no typing
  const saveToUndoDebounced = useCallback(() => {
    if (undoDebounceRef.current) {
      clearTimeout(undoDebounceRef.current);
    }
    undoDebounceRef.current = setTimeout(() => {
      saveToUndo();
    }, 500);
  }, [saveToUndo]);

  // Handle input change
  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true); // Mark as unsaved for autosave
    if (field === 'content_html') {
      // Debounced save to undo stack when content changes
      saveToUndoDebounced();
    }
    setErrors(prev => {
      if (prev[field]) {
        return { ...prev, [field]: null };
      }
      return prev;
    });
  }, [saveToUndoDebounced]);

  // Handle HTML file import
  const handleHtmlImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
      setErrors(prev => ({ ...prev, content_html: 'Vui lòng chọn file HTML' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const htmlContent = event.target?.result;
      if (typeof htmlContent === 'string') {
        // Sanitize HTML for editor display (removes decorative backgrounds, fixes CSS)
        // This handles: position:fixed, inset:0, z-index:-1, .background-container, .orb, etc.
        const sanitizedContent = sanitizeHtmlForEditor(htmlContent);
        forceSaveToUndo();
        handleChange('content_html', sanitizedContent.trim());
        setSuccessMessage('Đã import nội dung HTML');
        setTimeout(() => setSuccessMessage(''), 2000);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  // Undo action
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const newUndoStack = [...undoStack];
    const previousValue = newUndoStack.pop();
    const currentContent = formData.content_html;
    setRedoStack(prev => [...prev, currentContent]);
    setUndoStack(newUndoStack);
    lastSavedContentRef.current = previousValue;
    setFormData(prev => ({ ...prev, content_html: previousValue }));
  }, [undoStack, formData.content_html]);

  // Redo action
  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const newRedoStack = [...redoStack];
    const nextValue = newRedoStack.pop();
    const currentContent = formData.content_html;
    setUndoStack(prev => [...prev, currentContent]);
    setRedoStack(newRedoStack);
    lastSavedContentRef.current = nextValue;
    setFormData(prev => ({ ...prev, content_html: nextValue }));
  }, [redoStack, formData.content_html]);

  // Force save to undo - saves current state immediately before a change
  const forceSaveToUndo = useCallback(() => {
    // Cancel any pending debounced save to prevent double-saving
    if (undoDebounceRef.current) {
      clearTimeout(undoDebounceRef.current);
      undoDebounceRef.current = null;
    }

    const currentContent = formData.content_html;
    // Only save if content exists and is different from last saved
    // Save the CURRENT state (before the change) so we can undo back to it
    if (currentContent && currentContent !== lastSavedContentRef.current) {
      setUndoStack(prev => [...prev.slice(-19), currentContent]);
      setRedoStack([]);
      lastSavedContentRef.current = currentContent;
      // Skip the next debounced save since we already saved
      skipNextUndoSaveRef.current = true;
    }
  }, [formData.content_html]);

  // Re-sanitize current content - removes decorative elements and fixes CSS
  const handleReSanitize = () => {
    if (!formData.content_html) {
      setErrors(prev => ({ ...prev, content_html: 'Không có nội dung để xử lý' }));
      return;
    }

    try {
      forceSaveToUndo();

      // Only remove decorative elements, DON'T touch CSS or styles
      const parser = new DOMParser();
      const doc = parser.parseFromString(formData.content_html, 'text/html');

      // Remove ONLY decorative elements that cause visual issues
      const decorativeSelectors = [
        '.background-container',
        '.bg-container',
        '.bg-layer',
        '.bg-layer-base',
        '.orb',
        '.orb-1',
        '.orb-2',
        '.orb-3'
      ];

      let removedCount = 0;
      decorativeSelectors.forEach(selector => {
        try {
          doc.querySelectorAll(selector).forEach(el => {
            el.remove();
            removedCount++;
          });
        } catch (e) {
          // Skip invalid selectors
        }
      });

      const cleanedContent = doc.body?.innerHTML || formData.content_html;
      handleChange('content_html', cleanedContent);
      setSuccessMessage(`Đã xóa ${removedCount} decorative elements (background, orb)`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('[LessonEditor] Error cleaning HTML:', err);
      setErrors(prev => ({ ...prev, content_html: 'Lỗi khi xử lý HTML' }));
    }
  };

  // Insert HTML tag at cursor position
  const insertHtmlTag = (item) => {
    if (item.id === 'undo') {
      handleUndo();
      return;
    }
    if (item.id === 'redo') {
      handleRedo();
      return;
    }

    const textarea = textareaRef.current;
    if (!textarea) return;

    forceSaveToUndo();

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content_html.substring(start, end);
    const beforeText = formData.content_html.substring(0, start);
    const afterText = formData.content_html.substring(end);

    let newText;
    if (selectedText) {
      // Wrap selected text with tags
      newText = beforeText + item.tag + selectedText + item.closeTag + afterText;
    } else {
      // Insert tags at cursor
      newText = beforeText + item.tag + item.closeTag + afterText;
    }

    handleChange('content_html', newText);

    // Set cursor position after the opening tag
    setTimeout(() => {
      const newCursorPos = selectedText
        ? start + item.tag.length + selectedText.length + item.closeTag.length
        : start + item.tag.length;
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // ═══════════════════════════════════════════════════════════════════
  // CONVERT <style> TAGS TO INLINE STYLES
  // For landing page templates that use <style> tags
  // ═══════════════════════════════════════════════════════════════════
  const convertStyleTagsToInline = useCallback((html) => {
    if (!html || typeof html !== 'string') return html;

    // Check if HTML contains <style> tags
    if (!html.includes('<style')) return html;

    try {
      // Create a temporary DOM to work with
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Extract CSS variables from :root
      const cssVariables = {};
      const styleTags = doc.querySelectorAll('style');

      styleTags.forEach(styleTag => {
        const cssText = styleTag.textContent || '';

        // Extract :root variables
        const rootMatch = cssText.match(/:root\s*\{([^}]+)\}/);
        if (rootMatch) {
          const varDeclarations = rootMatch[1].match(/--[\w-]+:\s*[^;]+/g) || [];
          varDeclarations.forEach(decl => {
            const [name, value] = decl.split(':').map(s => s.trim());
            if (name && value) {
              cssVariables[name] = value;
            }
          });
        }
      });

      // Function to resolve CSS variables
      const resolveVariables = (value) => {
        if (!value) return value;
        return value.replace(/var\((--[\w-]+)\)/g, (match, varName) => {
          return cssVariables[varName] || match;
        });
      };

      // Parse CSS rules from all <style> tags
      const cssRules = [];
      styleTags.forEach(styleTag => {
        const cssText = styleTag.textContent || '';

        // Remove comments
        const cleanCss = cssText.replace(/\/\*[\s\S]*?\*\//g, '');

        // Match CSS rules (selector { properties })
        // Skip @keyframes, @media, :root, etc.
        const ruleRegex = /([^{@]+)\{([^}]+)\}/g;
        let match;

        while ((match = ruleRegex.exec(cleanCss)) !== null) {
          const selector = match[1].trim();
          const properties = match[2].trim();

          // Skip special selectors
          if (selector.startsWith('@') ||
              selector.startsWith(':root') ||
              selector.includes('::before') ||
              selector.includes('::after') ||
              selector.includes(':hover') ||
              selector.includes(':active') ||
              selector.includes(':focus') ||
              selector.includes('@keyframes')) {
            continue;
          }

          // Parse properties into object
          const propsObj = {};
          properties.split(';').forEach(prop => {
            const colonIndex = prop.indexOf(':');
            if (colonIndex > 0) {
              const propName = prop.substring(0, colonIndex).trim();
              let propValue = prop.substring(colonIndex + 1).trim();

              // Resolve CSS variables
              propValue = resolveVariables(propValue);

              // Skip animation-related properties that cause opacity:0 issues
              if (propName === 'opacity' && propValue === '0') {
                propValue = '1'; // Force visible
              }
              if (propName === 'animation' || propName === 'animation-name') {
                return; // Skip animations
              }

              if (propName && propValue) {
                propsObj[propName] = propValue;
              }
            }
          });

          if (Object.keys(propsObj).length > 0) {
            cssRules.push({ selector, properties: propsObj });
          }
        }
      });

      // Get body content (or full document if no body)
      let contentRoot = doc.body || doc.documentElement;

      // Apply CSS rules to matching elements
      cssRules.forEach(({ selector, properties }) => {
        try {
          // Handle multiple selectors (comma-separated)
          const selectors = selector.split(',').map(s => s.trim());

          selectors.forEach(sel => {
            if (!sel || sel.includes(':')) return; // Skip pseudo-selectors

            const elements = contentRoot.querySelectorAll(sel);
            elements.forEach(el => {
              // Merge with existing inline styles
              Object.entries(properties).forEach(([prop, value]) => {
                // Convert CSS property name to camelCase for style object
                // But we'll use setAttribute for the style string
                const existingStyle = el.getAttribute('style') || '';

                // Check if this property already exists in inline style
                const propRegex = new RegExp(`${prop}\\s*:`, 'i');
                if (!propRegex.test(existingStyle)) {
                  el.style.setProperty(prop, value);
                }
              });
            });
          });
        } catch (selectorError) {
          // Invalid selector, skip
          console.warn('[StyleConvert] Invalid selector:', selector);
        }
      });

      // Remove <style> tags from output
      styleTags.forEach(tag => tag.remove());

      // Remove <script> tags for safety
      doc.querySelectorAll('script').forEach(tag => tag.remove());

      // Get the processed HTML
      let result = contentRoot.innerHTML;

      // Clean up - remove empty style attributes
      result = result.replace(/\s*style=""\s*/g, ' ');

      console.log('[StyleConvert] Converted', cssRules.length, 'CSS rules to inline styles');
      console.log('[StyleConvert] CSS Variables found:', Object.keys(cssVariables).length);

      return result;
    } catch (error) {
      console.error('[StyleConvert] Error converting styles:', error);
      return html; // Return original on error
    }
  }, []);

  // Handle paste from clipboard
  const handlePaste = async (e) => {
    // Allow default paste behavior but save to undo
    forceSaveToUndo();
  };

  // Insert image HTML at cursor position in editor
  const insertImageAtCursor = (imageUrl, altText = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    forceSaveToUndo();

    const imgTag = `<img src="${imageUrl}" alt="${altText}" style="width: 100%; max-width: 800px; height: auto; display: block; margin-top: 16px; margin-left: auto; margin-right: auto; margin-bottom: 40px; padding: 0; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.2);" />`;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const beforeText = formData.content_html.substring(0, start);
    const afterText = formData.content_html.substring(end);
    const newText = beforeText + imgTag + afterText;

    handleChange('content_html', newText);

    // Set cursor after the inserted tag
    setTimeout(() => {
      const newCursorPos = start + imgTag.length;
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);

    setSuccessMessage('Đã chèn hình ảnh');
    setTimeout(() => setSuccessMessage(''), 1500);
  };

  // ═══════════════════════════════════════════════════════════════════
  // ELEMENT PATH HELPERS - Store/restore element selection across re-renders
  // ═══════════════════════════════════════════════════════════════════

  // Get path to element from editor root (array of child indices)
  const getElementPath = (element, root) => {
    const path = [];
    let current = element;
    while (current && current !== root && current.parentNode) {
      const parent = current.parentNode;
      const index = Array.from(parent.children).indexOf(current);
      if (index === -1) break;
      path.unshift(index);
      current = parent;
    }
    return path.length > 0 ? path : null;
  };

  // Find element by path from editor root
  const getElementByPath = (path, root) => {
    if (!path || !root) return null;
    let current = root;
    for (const index of path) {
      if (!current.children || !current.children[index]) return null;
      current = current.children[index];
    }
    return current;
  };

  // Find meaningful parent container for selection
  // OPTIMIZED: Walk up DOM tree only - NO getBoundingClientRect to avoid layout thrashing
  const findMeaningfulParent = (element, container) => {
    // Check if element is a placeholder or placeholder wrapper
    const isPlaceholderOrWrapper = (el) => {
      if (!el) return false;
      const classAttr = el.getAttribute ? el.getAttribute('class') || '' : '';
      return classAttr.includes('placeholder') ||
             classAttr.includes('lesson-image') ||
             classAttr.includes('empty-card');
    };

    // ═══ STEP 0: Check if clicked element IS a spacer - return it directly ═══
    // Spacers should always be directly selectable, regardless of nesting
    if (element.classList?.contains('spacer')) {
      return element;
    }

    // Also check if we clicked inside a spacer (on the ::after pseudo-element area)
    let current = element;
    while (current && current !== container) {
      if (current.classList?.contains('spacer')) {
        return current;
      }
      // Don't walk too far up for spacers - stop at common containers
      if (current.parentElement === container) break;
      current = current.parentElement;
    }

    // ═══ STEP 1: Walk up to find OUTERMOST placeholder wrapper (highest priority) ═══
    // Keep walking up to find all nested placeholder wrappers, return the outermost one
    current = element;
    let outermostPlaceholder = null;

    while (current && current !== container) {
      if (isPlaceholderOrWrapper(current)) {
        outermostPlaceholder = current;
        // Continue walking up to find if there's an outer wrapper
      }
      current = current.parentElement;
    }

    // If we found any placeholder wrapper, return the outermost one
    if (outermostPlaceholder) {
      return outermostPlaceholder;
    }

    // ═══ STEP 2: If clicked on IMG, select it ═══
    if (element.tagName === 'IMG') {
      return element;
    }

    // ═══ STEP 3: Walk up to find small container ═══
    const smallContainerClasses = [
      'info-card', 'warning-card', 'success-card', 'tip-card',
      'feature-item', 'feature-card', 'product-card', 'grid-cell',
      'card-icon', 'icon-wrapper', 'highlight-box', 'glass-card'
    ];

    current = element;
    while (current && current !== container) {
      if (current.classList) {
        for (const cls of smallContainerClasses) {
          if (current.classList.contains(cls)) {
            return current;
          }
        }
      }
      // Stop at large containers
      if (current.tagName === 'SECTION' || current.tagName === 'DETAILS' ||
          current.classList?.contains('grid-2x2') || current.classList?.contains('hero-section')) {
        break;
      }
      current = current.parentElement;
    }

    // ═══ STEP 4: Return clicked element ═══
    return element;
  };

  // ═══════════════════════════════════════════════════════════════════
  // CONTEXT MENU - Copy/Duplicate/Paste with full styles
  // ═══════════════════════════════════════════════════════════════════

  // Clone element with computed styles inlined (preserves appearance when copied)
  const cloneElementWithStyles = useCallback((element) => {
    if (!element) return null;

    // Deep clone the element
    const clone = element.cloneNode(true);

    // Function to inline computed styles
    const inlineStyles = (original, cloned) => {
      if (original.nodeType !== 1) return; // Only process element nodes

      const computedStyle = window.getComputedStyle(original);
      const importantStyles = [
        'display', 'position', 'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
        'margin', 'padding', 'border', 'border-radius', 'box-shadow',
        'background', 'background-color', 'background-image', 'background-size', 'background-position',
        'color', 'font-family', 'font-size', 'font-weight', 'font-style', 'line-height', 'text-align', 'text-decoration',
        'opacity', 'transform', 'transition', 'overflow', 'flex', 'flex-direction', 'align-items', 'justify-content', 'gap',
        'grid-template-columns', 'grid-template-rows', 'aspect-ratio', 'object-fit', 'object-position'
      ];

      importantStyles.forEach(prop => {
        const value = computedStyle.getPropertyValue(prop);
        if (value && value !== 'none' && value !== 'auto' && value !== 'normal' && value !== '0px') {
          cloned.style.setProperty(prop, value);
        }
      });

      // Recursively process children
      const originalChildren = original.children;
      const clonedChildren = cloned.children;
      for (let i = 0; i < originalChildren.length; i++) {
        if (clonedChildren[i]) {
          inlineStyles(originalChildren[i], clonedChildren[i]);
        }
      }
    };

    inlineStyles(element, clone);
    return clone;
  }, []);

  // Handle context menu actions
  const handleContextMenuAction = useCallback((action) => {
    const element = contextMenu.element;

    // Find the editor element - try multiple selectors
    let editorElement = element?.closest('.wysiwyg-editor');
    if (!editorElement) {
      editorElement = element?.closest('.html-preview');
    }
    if (!editorElement) {
      editorElement = element?.closest('[contenteditable="true"]');
    }
    if (!editorElement) {
      // Walk up to find contentEditable
      let parent = element?.parentElement;
      while (parent && parent.tagName !== 'BODY') {
        if (parent.contentEditable === 'true' || parent.getAttribute('contenteditable') === 'true') {
          editorElement = parent;
          break;
        }
        parent = parent.parentElement;
      }
    }

    console.log('[ContextMenu] Action:', action);
    console.log('[ContextMenu] Element:', element?.tagName, element?.className);
    console.log('[ContextMenu] Editor found:', !!editorElement, editorElement?.className);

    if (!element) {
      console.error('[ContextMenu] No element selected');
      setContextMenu({ visible: false, x: 0, y: 0, element: null });
      return;
    }

    // If no editor found, try to use fallback
    if (!editorElement) {
      editorElement = document.querySelector('.wysiwyg-editor') || document.querySelector('[contenteditable="true"]');
      console.log('[ContextMenu] Using fallback editor:', !!editorElement);
    }

    if (!editorElement) {
      console.error('[ContextMenu] Could not find any editor');
      setError('Không tìm thấy editor');
      setTimeout(() => setError(''), 2000);
      setContextMenu({ visible: false, x: 0, y: 0, element: null });
      return;
    }

    // Check if element is still connected to DOM
    let elementToUse = element;
    if (!element.isConnected) {
      console.log('[ContextMenu] Element disconnected, action may fail');
      // For copy, we can still use the stored outerHTML
      // For duplicate/paste/delete, this might cause issues
    }

    switch (action) {
      case 'copy': {
        // Clone with styles and store - works even if element is disconnected
        const clonedForCopy = cloneElementWithStyles(element);
        setCopiedElement(clonedForCopy?.outerHTML || null);
        setSuccessMessage('Đã copy component');
        setTimeout(() => setSuccessMessage(''), 1500);
        break;
      }

      case 'duplicate': {
        // Clone and insert after original
        console.log('[ContextMenu] Duplicate - element.isConnected:', element.isConnected);
        console.log('[ContextMenu] Duplicate - element.parentNode:', !!element.parentNode);

        // If element is disconnected, try to find it in the editor by its outerHTML signature
        let targetElement = element;
        if (!element.isConnected || !element.parentNode) {
          console.log('[ContextMenu] Element disconnected, trying to find in editor...');
          // Cannot duplicate disconnected element
          setError('Element không còn trong editor. Hãy thử lại.');
          setTimeout(() => setError(''), 2000);
          break;
        }

        forceSaveToUndo();

        // Clone the element
        const clonedForDuplicate = targetElement.cloneNode(true);

        if (clonedForDuplicate) {
          // Remove any selection classes from clone
          clonedForDuplicate.classList?.remove('selected-for-delete');

          // Insert after the original element
          if (targetElement.nextSibling) {
            targetElement.parentNode.insertBefore(clonedForDuplicate, targetElement.nextSibling);
          } else {
            targetElement.parentNode.appendChild(clonedForDuplicate);
          }

          console.log('[ContextMenu] Duplicated:', clonedForDuplicate.tagName, clonedForDuplicate.className);

          // Sync changes to formData
          const newHtml1 = editorElement.innerHTML;
          console.log('[ContextMenu] New HTML length:', newHtml1.length);

          isInternalEditRef.current = true;
          lastContentFromEditorRef.current = newHtml1;
          handleChange('content_html', newHtml1);
          setSuccessMessage('Đã nhân đôi component');
          setTimeout(() => setSuccessMessage(''), 1500);
        } else {
          console.error('[ContextMenu] Failed to clone element');
          setError('Không thể nhân đôi component này');
          setTimeout(() => setError(''), 2000);
        }
        break;
      }

      case 'paste': {
        console.log('[ContextMenu] Paste - copiedElement exists:', !!copiedElement);
        console.log('[ContextMenu] Paste - element.isConnected:', element.isConnected);

        if (!copiedElement) {
          setError('Chưa có component nào được copy');
          setTimeout(() => setError(''), 2000);
          break;
        }

        // Check if element is still connected
        if (!element.isConnected || !element.parentNode) {
          console.log('[ContextMenu] Target element disconnected, appending to editor instead');
          // Append to end of editor instead
          forceSaveToUndo();
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = copiedElement;
          const pastedElement = tempDiv.firstElementChild || tempDiv.firstChild;

          if (pastedElement) {
            pastedElement.classList?.remove('selected-for-delete');
            editorElement.appendChild(pastedElement);

            const newHtml2 = editorElement.innerHTML;
            isInternalEditRef.current = true;
            lastContentFromEditorRef.current = newHtml2;
            handleChange('content_html', newHtml2);
            setSuccessMessage('Đã dán component (cuối trang)');
            setTimeout(() => setSuccessMessage(''), 1500);
          }
          break;
        }

        // Normal paste - insert after element
        forceSaveToUndo();
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = copiedElement;
        const pastedElement = tempDiv.firstElementChild || tempDiv.firstChild;

        if (pastedElement) {
          pastedElement.classList?.remove('selected-for-delete');

          // Insert after the target element
          if (element.nextSibling) {
            element.parentNode.insertBefore(pastedElement, element.nextSibling);
          } else {
            element.parentNode.appendChild(pastedElement);
          }

          console.log('[ContextMenu] Pasted:', pastedElement.tagName, pastedElement.className);

          // Sync changes
          const newHtml2 = editorElement.innerHTML;
          console.log('[ContextMenu] New HTML length:', newHtml2.length);

          isInternalEditRef.current = true;
          lastContentFromEditorRef.current = newHtml2;
          handleChange('content_html', newHtml2);
          setSuccessMessage('Đã dán component');
          setTimeout(() => setSuccessMessage(''), 1500);
        } else {
          console.error('[ContextMenu] Failed to parse copied HTML');
          setError('Không thể dán component');
          setTimeout(() => setError(''), 2000);
        }
        break;
      }

      case 'delete': {
        // ═══ SAVE SCROLL POSITIONS BEFORE DELETE ═══
        // This prevents layout shift when element is removed
        const editorScrollTop = editorElement.scrollTop;
        const editorScrollLeft = editorElement.scrollLeft;
        const parentScrollTop = editorElement.parentElement?.scrollTop || 0;
        const windowScrollY = window.scrollY;
        const windowScrollX = window.scrollX;

        forceSaveToUndo();
        element.remove();
        selectedElementPathRef.current = null; // Clear path ref

        // Sync changes
        const newHtml3 = editorElement.innerHTML;
        isInternalEditRef.current = true;
        lastContentFromEditorRef.current = newHtml3;
        handleChange('content_html', newHtml3);

        // ═══ RESTORE SCROLL POSITIONS AFTER DELETE ═══
        requestAnimationFrame(() => {
          editorElement.scrollTop = editorScrollTop;
          editorElement.scrollLeft = editorScrollLeft;
          if (editorElement.parentElement) {
            editorElement.parentElement.scrollTop = parentScrollTop;
          }
          window.scrollTo(windowScrollX, windowScrollY);
        });

        setSuccessMessage('Đã xóa component');
        setTimeout(() => setSuccessMessage(''), 1500);
        break;
      }

      default:
        break;
    }

    setContextMenu({ visible: false, x: 0, y: 0, element: null });
  }, [contextMenu.element, copiedElement, cloneElementWithStyles, forceSaveToUndo, handleChange]);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu.visible) {
        setContextMenu({ visible: false, x: 0, y: 0, element: null });
      }
    };

    if (contextMenu.visible) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('contextmenu', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('contextmenu', handleClickOutside);
    };
  }, [contextMenu.visible]);

  // ═══════════════════════════════════════════════════════════════════
  // SMART DROP - Insert between blocks instead of inside them
  // ═══════════════════════════════════════════════════════════════════

  // Find the best drop target and position (before, after, or inside)
  const findDropTarget = (e, editorElement) => {
    const x = e.clientX;
    const y = e.clientY;

    // Block-level elements that we want to insert between
    const blockSelectors = 'div, section, p, blockquote, h1, h2, h3, h4, h5, h6, ul, ol, table, pre, hr, figure';
    const blocks = editorElement.querySelectorAll(blockSelectors);

    // Edge threshold - how close to top/bottom edge to trigger before/after insertion
    const EDGE_THRESHOLD = 40; // pixels - increased for better UX

    // Helper: Check if block is a large container that shouldn't receive 'inside' drops
    const isLargeContainer = (block) => {
      const classAttr = block.getAttribute('class') || '';
      return block.querySelector('img') ||
             classAttr.includes('placeholder') ||
             classAttr.includes('lesson-image') ||
             classAttr.includes('hero-section') ||
             classAttr.includes('feature-card') ||
             classAttr.includes('grid-2x2') ||
             classAttr.includes('product-card') ||
             block.tagName === 'FIGURE';
    };

    let bestTarget = null;
    let bestPosition = 'inside'; // 'before', 'after', 'inside'
    let minDistance = Infinity;

    blocks.forEach((block) => {
      // Skip if block is a direct child element of a larger container we're already considering
      if (block.parentElement !== editorElement &&
          block.parentElement?.closest('[class*="placeholder"], [class*="lesson-image"], [class*="hero-section"]')) {
        return;
      }

      const rect = block.getBoundingClientRect();

      // Skip very small elements (likely inline or wrapper)
      if (rect.height < 10) return;

      // Check if mouse X is within the block's horizontal bounds (with some padding)
      const xPadding = 20;
      if (x >= rect.left - xPadding && x <= rect.right + xPadding) {
        // Check vertical position
        const topDist = Math.abs(y - rect.top);
        const bottomDist = Math.abs(y - rect.bottom);
        const centerY = rect.top + rect.height / 2;

        // For large containers, use larger threshold and prefer before/after
        const threshold = isLargeContainer(block) ? Math.max(EDGE_THRESHOLD, rect.height * 0.3) : EDGE_THRESHOLD;

        // Near top edge?
        if (topDist < threshold && topDist < minDistance) {
          minDistance = topDist;
          bestTarget = block;
          bestPosition = 'before';
        }
        // Near bottom edge?
        else if (bottomDist < threshold && bottomDist < minDistance) {
          minDistance = bottomDist;
          bestTarget = block;
          bestPosition = 'after';
        }
        // Inside the block - but for large containers, decide based on which half
        else if (y >= rect.top && y <= rect.bottom) {
          if (isLargeContainer(block)) {
            // For large containers, decide before/after based on which half of the block
            const distFromTop = y - rect.top;
            const distFromBottom = rect.bottom - y;
            minDistance = Math.min(distFromTop, distFromBottom);
            bestTarget = block;
            bestPosition = distFromTop < distFromBottom ? 'before' : 'after';
          } else {
            // Regular blocks can receive 'inside' drops
            const centerDist = Math.abs(y - centerY);
            if (centerDist < minDistance) {
              minDistance = centerDist;
              bestTarget = block;
              bestPosition = 'inside';
            }
          }
        }
      }
    });

    // If no specific block found, check gaps between blocks
    if (!bestTarget || bestPosition === 'inside') {
      const blocksArray = Array.from(blocks);
      for (let i = 0; i < blocksArray.length - 1; i++) {
        const block1 = blocksArray[i];
        const block2 = blocksArray[i + 1];
        const rect1 = block1.getBoundingClientRect();
        const rect2 = block2.getBoundingClientRect();

        // Check if Y is in the gap between two blocks
        if (y > rect1.bottom && y < rect2.top) {
          const gapCenter = (rect1.bottom + rect2.top) / 2;
          const distToGap = Math.abs(y - gapCenter);
          if (distToGap < minDistance) {
            minDistance = distToGap;
            bestTarget = block2;
            bestPosition = 'before';
          }
        }
      }
    }

    // Final safety: If best position is still 'inside' for a large container, change to 'after'
    if (bestTarget && bestPosition === 'inside' && isLargeContainer(bestTarget)) {
      bestPosition = 'after';
    }

    return { target: bestTarget, position: bestPosition };
  };

  // ═══════════════════════════════════════════════════════════════════
  // AUTO-ADAPT BACKGROUND - Adjust component styles to match parent section
  // ═══════════════════════════════════════════════════════════════════

  // Get the effective background color of an element (walking up the tree if needed)
  const getEffectiveBackground = (element) => {
    if (!element) return null;

    let current = element;
    while (current && current !== document.body) {
      const style = window.getComputedStyle(current);
      const bg = style.backgroundColor;

      // Check if it's a real background (not transparent)
      if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
        return bg;
      }

      // Check for gradient backgrounds
      const bgImage = style.backgroundImage;
      if (bgImage && bgImage !== 'none') {
        // Extract dominant color from gradient if possible
        const colorMatch = bgImage.match(/rgba?\([^)]+\)/);
        if (colorMatch) {
          return colorMatch[0];
        }
      }

      current = current.parentElement;
    }
    return 'rgb(0, 0, 0)'; // Default dark background
  };

  // Parse RGB/RGBA string to {r, g, b, a}
  const parseColor = (colorStr) => {
    if (!colorStr) return { r: 0, g: 0, b: 0, a: 1 };

    const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (match) {
      return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3]),
        a: match[4] ? parseFloat(match[4]) : 1
      };
    }
    return { r: 0, g: 0, b: 0, a: 1 };
  };

  // Calculate luminance (0 = dark, 1 = bright)
  const getLuminance = (color) => {
    const { r, g, b } = color;
    // Using relative luminance formula
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  };

  // Adapt component HTML to match parent section's background
  const adaptComponentToBackground = (htmlString, targetElement) => {
    if (!targetElement) return htmlString;

    const bgColor = getEffectiveBackground(targetElement);
    const parsedBg = parseColor(bgColor);
    const luminance = getLuminance(parsedBg);

    // Determine if background is light or dark
    const isLightBg = luminance > 0.5;

    // Create temporary element to modify styles
    const temp = document.createElement('div');
    temp.innerHTML = htmlString;

    const adaptElement = (el) => {
      if (!el || el.nodeType !== 1) return;

      const style = el.style;
      const hasInlineStyle = el.hasAttribute('style');

      // Only adapt if element has inline styles (our components do)
      if (hasInlineStyle) {
        // Check for transparent or missing backgrounds
        const bgStyle = style.background || style.backgroundColor;
        const needsAdaptation =
          !bgStyle ||
          bgStyle === 'transparent' ||
          bgStyle.includes('rgba(0, 0, 0, 0)');

        if (needsAdaptation) {
          // Set semi-transparent background based on parent luminance
          if (isLightBg) {
            // Light parent = use darker semi-transparent overlay
            style.background = 'rgba(0, 0, 0, 0.05)';
          } else {
            // Dark parent = use lighter semi-transparent overlay
            style.background = 'rgba(255, 255, 255, 0.05)';
          }
        }

        // Adapt text colors if they might clash
        if (style.color) {
          const textColor = parseColor(style.color);
          const textLum = getLuminance(textColor);
          const contrast = Math.abs(luminance - textLum);

          // If contrast is too low, adjust text color
          if (contrast < 0.3) {
            if (isLightBg) {
              style.color = '#1A1A1A'; // Dark text on light bg
            } else {
              style.color = '#E8E8E8'; // Light text on dark bg
            }
          }
        }
      }

      // Recursively adapt children
      Array.from(el.children).forEach(adaptElement);
    };

    adaptElement(temp.firstElementChild);

    return temp.innerHTML;
  };

  // Insert HTML at a specific position relative to a target element
  const insertHtmlAtTarget = (htmlString, target, position, editorElement) => {
    // Create a temporary container to parse the HTML
    const temp = document.createElement('div');
    temp.innerHTML = htmlString;
    const newElement = temp.firstElementChild || temp.firstChild;

    if (!newElement) return false;

    if (target && position !== 'inside') {
      // Insert before or after the target element
      if (position === 'before') {
        target.parentNode.insertBefore(newElement, target);
      } else if (position === 'after') {
        target.parentNode.insertBefore(newElement, target.nextSibling);
      }
    } else {
      // Fallback: use caret position for 'inside' or when no target
      const range = document.caretRangeFromPoint(event.clientX, event.clientY);
      if (range) {
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        document.execCommand('insertHTML', false, htmlString);
        return true;
      } else {
        // Last fallback: append to editor
        editorElement.appendChild(newElement);
      }
    }

    return true;
  };

  // Handle drop on editor (toolbox items, images from panel, or files from PC)
  const handleEditorDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOverEditor(false);

    // ═══ 1. Check for Toolbox Component ═══
    const toolboxData = e.dataTransfer.getData('application/x-toolbox-item');
    if (toolboxData) {
      try {
        const item = JSON.parse(toolboxData);
        if (item.html) {
          // Insert component HTML at cursor position
          const textarea = textareaRef.current;
          if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const beforeText = formData.content_html.substring(0, start);
            const afterText = formData.content_html.substring(end);
            const newText = beforeText + '\n' + item.html + '\n' + afterText;
            forceSaveToUndo();
            handleChange('content_html', newText);
            setSuccessMessage(`Đã thêm: ${item.label}`);
            setTimeout(() => setSuccessMessage(''), 1500);
            // Move cursor after inserted content
            setTimeout(() => {
              textarea.selectionStart = textarea.selectionEnd = start + item.html.length + 2;
              textarea.focus();
            }, 0);
          }
          return;
        }
      } catch (err) {
        console.error('Error parsing toolbox item:', err);
      }
    }

    // ═══ 2. Check for image data from panel (dragged image) ═══
    const imageData = e.dataTransfer.getData('application/json');
    if (imageData) {
      try {
        const img = JSON.parse(imageData);
        insertImageAtCursor(img.image_url, img.alt_text || img.position_id);
        return;
      } catch (err) {
        console.error('Error parsing image data:', err);
      }
    }

    // ═══ 3. Check for files dropped from PC ═══
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length > 0 && lessonId && lessonId !== 'new') {
      for (const file of files) {
        try {
          const positionId = courseImageService.generatePositionId(file.name);
          const { data, error } = await courseImageService.uploadAndCreate(file, lessonId, { positionId });
          if (error) throw error;
          if (data) {
            setLessonImages(prev => [...prev, data]);
            insertImageAtCursor(data.image_url, data.alt_text || data.position_id);
          }
        } catch (err) {
          console.error('Upload error:', err);
          setError(`Lỗi upload: ${err.message}`);
        }
      }
    } else if (files.length > 0) {
      setError('Lưu bài học trước khi upload hình');
    }
  };

  // Handle paste HTML from clipboard button
  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        forceSaveToUndo();
        const textarea = textareaRef.current;
        const start = textarea?.selectionStart || formData.content_html.length;
        const end = textarea?.selectionEnd || formData.content_html.length;
        const beforeText = formData.content_html.substring(0, start);
        const afterText = formData.content_html.substring(end);

        // Convert <style> tags to inline styles for Shopify compatibility
        const processedText = convertStyleTagsToInline(text);

        const newText = beforeText + processedText + afterText;
        handleChange('content_html', newText);

        // Show appropriate message
        if (text.includes('<style')) {
          setSuccessMessage('Đã dán và chuyển đổi <style> thành inline styles');
        } else {
          setSuccessMessage('Đã dán nội dung từ clipboard');
        }
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('[LessonEditor] Paste error:', err);
      setError('Không thể dán từ clipboard. Vui lòng sử dụng Ctrl+V');
    }
  };

  // Copy HTML to clipboard
  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(formData.content_html);
      setSuccessMessage('Đã copy nội dung HTML');
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (err) {
      console.error('[LessonEditor] Copy error:', err);
      setError('Không thể copy');
    }
  };

  // Toggle fullscreen mode
  const toggleFullscreen = useCallback(() => {
    const newFullscreenState = !isFullscreen;
    setIsFullscreen(newFullscreenState);

    // Add/remove body class for fullscreen mode (hides TopNavBar, prevents scroll)
    if (newFullscreenState) {
      document.body.classList.add('editor-fullscreen-active');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('editor-fullscreen-active');
      document.body.style.overflow = '';
    }

    // Fetch images when entering fullscreen (if not already loaded)
    if (newFullscreenState && lessonId && lessonId !== 'new' && lessonImages.length === 0) {
      fetchLessonImages();
    }
  }, [isFullscreen, lessonId, lessonImages.length, fetchLessonImages]);

  // Cleanup fullscreen body class on unmount
  useEffect(() => {
    return () => {
      document.body.classList.remove('editor-fullscreen-active');
      document.body.style.overflow = '';
    };
  }, []);

  // Handle global keyboard shortcuts (Escape, Ctrl+S, Ctrl+Z)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Escape to exit fullscreen
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
        document.body.classList.remove('editor-fullscreen-active');
        document.body.style.overflow = '';
        return;
      }

      // Ctrl+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave(true); // Save and stay on page
        return;
      }

      // Ctrl+Z to undo (only when not in a text input/textarea)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        const target = e.target;
        const isTextInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

        // Only handle global undo if not in a text input (let browser handle it there)
        if (!isTextInput && undoStack.length > 0) {
          e.preventDefault();
          handleUndo();
          return;
        }
      }

      // Ctrl+Y or Ctrl+Shift+Z to redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        const target = e.target;
        const isTextInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

        if (!isTextInput && redoStack.length > 0) {
          e.preventDefault();
          handleRedo();
          return;
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, undoStack.length, redoStack.length]);

  // ═══════════════════════════════════════════════════════════
  // RESIZABLE COLUMNS - Drag to resize panel widths
  // ═══════════════════════════════════════════════════════════
  const handleResizeStart = useCallback((e, columnName) => {
    e.preventDefault();
    setResizingColumn(columnName);
    resizeStartX.current = e.clientX;
    resizeStartWidth.current = columnWidths[columnName];
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [columnWidths]);

  const handleResizeMove = useCallback((e) => {
    if (!resizingColumn) return;

    const delta = e.clientX - resizeStartX.current;
    // For right-side panels, invert delta
    const isRightPanel = ['mobilePreview', 'imagePanel'].includes(resizingColumn);
    const newWidth = resizeStartWidth.current + (isRightPanel ? -delta : delta);

    // Set min/max constraints
    const constraints = {
      outline: { min: 200, max: 400 },
      toolbox: { min: 180, max: 400 },
      mobilePreview: { min: 280, max: 600 },
      imagePanel: { min: 180, max: 450 },
    };

    const { min, max } = constraints[resizingColumn] || { min: 100, max: 500 };
    const clampedWidth = Math.max(min, Math.min(max, newWidth));

    setColumnWidths(prev => ({ ...prev, [resizingColumn]: clampedWidth }));
  }, [resizingColumn]);

  const handleResizeEnd = useCallback(() => {
    setResizingColumn(null);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  // Attach resize listeners
  useEffect(() => {
    if (resizingColumn) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
      return () => {
        window.removeEventListener('mousemove', handleResizeMove);
        window.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [resizingColumn, handleResizeMove, handleResizeEnd]);

  // ═══════════════════════════════════════════════════════════
  // ELEMENT RESIZE - Drag handles to resize selected components
  // ═══════════════════════════════════════════════════════════
  const handleElementResizeStart = useCallback((e, handle, element) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = element.getBoundingClientRect();
    setIsResizingElement(true);
    setResizeHandle(handle);
    resizeElementRef.current = element;
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: rect.width,
      height: rect.height,
      originalWidth: element.style.width || `${rect.width}px`,
      originalHeight: element.style.height || '',
    };

    document.body.style.cursor = getCursorForHandle(handle);
    document.body.style.userSelect = 'none';
    console.log('[ElementResize] Started:', handle, 'size:', rect.width, 'x', rect.height);
  }, []);

  const getCursorForHandle = (handle) => {
    const cursors = {
      'nw': 'nwse-resize', 'n': 'ns-resize', 'ne': 'nesw-resize',
      'w': 'ew-resize', 'e': 'ew-resize',
      'sw': 'nesw-resize', 's': 'ns-resize', 'se': 'nwse-resize'
    };
    return cursors[handle] || 'default';
  };

  const handleElementResizeMove = useCallback((e) => {
    if (!isResizingElement || !resizeElementRef.current) return;

    const element = resizeElementRef.current;
    const start = resizeStartRef.current;
    const deltaX = e.clientX - start.x;
    const deltaY = e.clientY - start.y;

    let newWidth = start.width;
    let newHeight = start.height;

    // Calculate new dimensions based on handle
    switch (resizeHandle) {
      case 'e':
        newWidth = Math.max(50, start.width + deltaX);
        break;
      case 'w':
        newWidth = Math.max(50, start.width - deltaX);
        break;
      case 's':
        newHeight = Math.max(30, start.height + deltaY);
        break;
      case 'n':
        newHeight = Math.max(30, start.height - deltaY);
        break;
      case 'se':
        newWidth = Math.max(50, start.width + deltaX);
        newHeight = Math.max(30, start.height + deltaY);
        break;
      case 'sw':
        newWidth = Math.max(50, start.width - deltaX);
        newHeight = Math.max(30, start.height + deltaY);
        break;
      case 'ne':
        newWidth = Math.max(50, start.width + deltaX);
        newHeight = Math.max(30, start.height - deltaY);
        break;
      case 'nw':
        newWidth = Math.max(50, start.width - deltaX);
        newHeight = Math.max(30, start.height - deltaY);
        break;
      default:
        break;
    }

    // Apply inline styles for width (height is often auto for text reflow)
    if (['e', 'w', 'ne', 'nw', 'se', 'sw'].includes(resizeHandle)) {
      element.style.width = `${newWidth}px`;
      element.style.maxWidth = `${newWidth}px`;
    }
    // Only set explicit height for vertical resize or corner resize
    if (['s', 'n', 'se', 'sw', 'ne', 'nw'].includes(resizeHandle)) {
      // For containers with text, prefer min-height to allow content to expand
      if (element.innerText && element.innerText.trim().length > 0) {
        element.style.minHeight = `${newHeight}px`;
        // Remove fixed height to allow text reflow
        element.style.height = 'auto';
      } else {
        element.style.height = `${newHeight}px`;
      }
    }

    // Update overlay position for visual feedback
    const newRect = element.getBoundingClientRect();
    setResizeOverlay({
      x: newRect.left,
      y: newRect.top,
      width: newRect.width,
      height: newRect.height
    });
  }, [isResizingElement, resizeHandle]);

  const handleElementResizeEnd = useCallback(() => {
    if (isResizingElement && resizeElementRef.current) {
      console.log('[ElementResize] Ended - saving changes');

      // Find editor to sync changes
      const element = resizeElementRef.current;
      let editorElement = element.closest('.wysiwyg-editor');
      if (!editorElement) editorElement = element.closest('.html-preview');
      if (!editorElement) editorElement = element.closest('[contenteditable="true"]');

      if (editorElement) {
        forceSaveToUndo();
        const newHtml = editorElement.innerHTML;
        isInternalEditRef.current = true;
        lastContentFromEditorRef.current = newHtml;
        handleChange('content_html', newHtml);
        setSuccessMessage('Đã resize component');
        setTimeout(() => setSuccessMessage(''), 1500);
      }
    }

    setIsResizingElement(false);
    setResizeHandle(null);
    resizeElementRef.current = null;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, [isResizingElement, forceSaveToUndo, handleChange]);

  // Attach element resize listeners
  useEffect(() => {
    if (isResizingElement) {
      window.addEventListener('mousemove', handleElementResizeMove);
      window.addEventListener('mouseup', handleElementResizeEnd);
      return () => {
        window.removeEventListener('mousemove', handleElementResizeMove);
        window.removeEventListener('mouseup', handleElementResizeEnd);
      };
    }
  }, [isResizingElement, handleElementResizeMove, handleElementResizeEnd]);

  // Update resize overlay when element is selected
  const updateResizeOverlay = useCallback((element) => {
    if (!element) {
      setResizeOverlay(null);
      return;
    }
    const rect = element.getBoundingClientRect();
    setResizeOverlay({
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
      element: element
    });
  }, []);

  // DISABLED: Resize overlay scroll tracking - causes performance issues
  // The resize overlay feature is disabled anyway (see render section with {false && ...})
  // Removing these scroll listeners significantly improves scroll performance

  // ═══════════════════════════════════════════════════════════
  // AUTO-SCROLL WHILE DRAGGING - OPTIMIZED with throttling
  // ═══════════════════════════════════════════════════════════
  const autoScrollRafRef = useRef(null);
  const scrollDirectionFSRef = useRef(null); // 'up', 'down', or null
  const lastDragOverTimeFS = useRef(0);
  const cachedEditorPanelRef = useRef(null);
  const cachedRectRef = useRef(null);

  useEffect(() => {
    if (!isFullscreen) return;

    // Cache the editor panel reference
    cachedEditorPanelRef.current = document.querySelector('.editor-content-panel');

    const handleGlobalDragOver = (e) => {
      // THROTTLE: Only process every 50ms
      const now = Date.now();
      if (now - lastDragOverTimeFS.current < 50) return;
      lastDragOverTimeFS.current = now;

      const editorPanel = cachedEditorPanelRef.current;
      if (!editorPanel) return;

      // Cache rect and only update every 100ms
      if (!cachedRectRef.current || now % 100 < 50) {
        cachedRectRef.current = editorPanel.getBoundingClientRect();
      }
      const rect = cachedRectRef.current;

      const scrollSpeed = 4; // Reduced from 12
      const edgeThreshold = 60; // Reduced from 80

      // Determine scroll direction
      let newDirection = null;
      if (e.clientX >= rect.left && e.clientX <= rect.right) {
        if (e.clientY < rect.top + edgeThreshold && e.clientY > rect.top - 50) {
          newDirection = 'up';
        } else if (e.clientY > rect.bottom - edgeThreshold && e.clientY < rect.bottom + 50) {
          newDirection = 'down';
        }
      }

      // Only update if direction changed
      if (newDirection !== scrollDirectionFSRef.current) {
        if (autoScrollRafRef.current) {
          cancelAnimationFrame(autoScrollRafRef.current);
          autoScrollRafRef.current = null;
        }
        scrollDirectionFSRef.current = newDirection;

        // Start smooth scroll with requestAnimationFrame
        if (newDirection) {
          const doScroll = () => {
            if (!scrollDirectionFSRef.current || !cachedEditorPanelRef.current) return;
            if (scrollDirectionFSRef.current === 'up') {
              cachedEditorPanelRef.current.scrollTop -= scrollSpeed;
            } else {
              cachedEditorPanelRef.current.scrollTop += scrollSpeed;
            }
            autoScrollRafRef.current = requestAnimationFrame(doScroll);
          };
          autoScrollRafRef.current = requestAnimationFrame(doScroll);
        }
      }
    };

    const handleGlobalDragEnd = () => {
      if (autoScrollRafRef.current) {
        cancelAnimationFrame(autoScrollRafRef.current);
        autoScrollRafRef.current = null;
      }
      scrollDirectionFSRef.current = null;
    };

    document.addEventListener('dragover', handleGlobalDragOver, { passive: true });
    document.addEventListener('dragend', handleGlobalDragEnd);
    document.addEventListener('drop', handleGlobalDragEnd);

    return () => {
      document.removeEventListener('dragover', handleGlobalDragOver);
      document.removeEventListener('dragend', handleGlobalDragEnd);
      document.removeEventListener('drop', handleGlobalDragEnd);
      if (autoScrollRafRef.current) {
        cancelAnimationFrame(autoScrollRafRef.current);
      }
      cachedEditorPanelRef.current = null;
      cachedRectRef.current = null;
    };
  }, [isFullscreen]);

  // ═══════════════════════════════════════════════════════════
  // GLOBAL FILE DRAG DETECTION - Detect file drag immediately
  // Prevents browser from opening files and shows visual feedback fast
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    let dragCounter = 0; // Track nested drag events

    const hasFiles = (e) => {
      // Check if dragging files (not internal elements)
      if (e.dataTransfer?.types) {
        return e.dataTransfer.types.includes('Files') ||
               e.dataTransfer.types.includes('application/x-moz-file');
      }
      return false;
    };

    const isDropZone = (element) => {
      // Check if element or parent is a designated drop zone
      return element?.closest('.fullscreen-images-panel') ||
             element?.closest('.sidebar-images-panel-inner') ||
             element?.closest('.images-sidebar') ||
             element?.closest('.wysiwyg-editor') ||
             element?.closest('.html-preview');
    };

    const handleDragEnter = (e) => {
      dragCounter++;
      if (hasFiles(e) && dragCounter === 1) {
        setIsDraggingFile(true);
      }
    };

    const handleDragOver = (e) => {
      // Prevent default for files AND JSON data (from Image Panel)
      // This is REQUIRED for drop event to fire on contentEditable!
      const hasJsonData = e.dataTransfer?.types?.includes('application/json');
      if (hasFiles(e) || hasJsonData) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
      }
    };

    const handleDragLeave = (e) => {
      dragCounter--;
      if (dragCounter <= 0) {
        dragCounter = 0;
        setIsDraggingFile(false);
      }
    };

    const handleDrop = (e) => {
      // Check if dropped on a valid drop zone
      const inDropZone = isDropZone(e.target);
      console.log('[GlobalDrag] Drop detected, inDropZone:', inDropZone, 'target:', e.target?.className);

      if (hasFiles(e) && !inDropZone) {
        // Dropped outside drop zones - prevent browser opening file
        e.preventDefault();
        console.log('[GlobalDrag] Drop outside drop zone - prevented');
        // Reset state immediately for outside drops
        dragCounter = 0;
        setIsDraggingFile(false);
      } else {
        // Inside drop zone - delay state reset to let target handler run first
        dragCounter = 0;
        // Don't reset isDraggingFile here - let the target handler do it
      }
    };

    // Add listeners to document - use capture phase for early detection
    document.addEventListener('dragenter', handleDragEnter, true);
    document.addEventListener('dragover', handleDragOver, true);
    document.addEventListener('dragleave', handleDragLeave, true);
    document.addEventListener('drop', handleDrop, true);

    return () => {
      document.removeEventListener('dragenter', handleDragEnter, true);
      document.removeEventListener('dragover', handleDragOver, true);
      document.removeEventListener('dragleave', handleDragLeave, true);
      document.removeEventListener('drop', handleDrop, true);
    };
  }, []);

  // Keep formDataRef in sync
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  // Autosave effect - triggers 2 seconds after last change
  useEffect(() => {
    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Only autosave if:
    // 1. Has unsaved changes
    // 2. Not currently saving
    // 3. Title is not empty (required field)
    // 4. Either editing OR already created a lesson
    const canAutoSave = hasUnsavedChanges &&
      !isSaving &&
      formData.title.trim() &&
      (isEditing || createdLessonId);

    if (canAutoSave) {
      autoSaveTimerRef.current = setTimeout(async () => {
        setAutoSaveStatus('saving');
        try {
          const targetId = isEditing ? lessonId : createdLessonId;
          const lessonData = {
            title: formDataRef.current.title,
            type: formDataRef.current.lesson_type,
            video_url: formDataRef.current.video_url || null,
            duration_minutes: formDataRef.current.duration_minutes || 0,
            is_preview: formDataRef.current.is_preview || false,
            module_id: moduleId,
            course_id: courseId,
          };

          if (formDataRef.current.content_html?.trim()) {
            // Save to ALL content columns for mobile compatibility
            lessonData.content = formDataRef.current.content_html;
            lessonData.html_content = formDataRef.current.content_html;
            lessonData.article_content = formDataRef.current.content_html;
          }

          const result = await lessonService.updateLesson(targetId, lessonData);
          if (result.success) {
            setAutoSaveStatus('saved');
            setHasUnsavedChanges(false);
            // Reset status after 2 seconds
            setTimeout(() => setAutoSaveStatus('idle'), 2000);
          } else {
            setAutoSaveStatus('error');
            setTimeout(() => setAutoSaveStatus('idle'), 3000);
          }
        } catch (err) {
          console.error('[LessonEditor] Autosave error:', err);
          setAutoSaveStatus('error');
          setTimeout(() => setAutoSaveStatus('idle'), 3000);
        }
      }, 2000); // 2 second delay
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [hasUnsavedChanges, formData, isSaving, isEditing, lessonId, createdLessonId, moduleId, courseId]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Vui lòng nhập tiêu đề bài học';
    }

    // Video URL is optional - removed required validation
    // Article content is also optional now

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = async (stayOnPage = false) => {
    // Prevent double-save while saving
    if (isSaving) {
      console.log('[LessonEditor] Already saving, ignoring duplicate call');
      return;
    }

    if (!validateForm()) return;

    setIsSaving(true);
    setError(null);

    try {
      // Transform to match DB schema
      const lessonData = {
        title: formData.title,
        type: formData.lesson_type,
        video_url: formData.video_url || null,
        duration_minutes: formData.duration_minutes || 0,
        is_preview: formData.is_preview || false,
        module_id: moduleId,
        course_id: courseId,
      };

      // Save content to ALL content columns for mobile compatibility
      if (formData.content_html && formData.content_html.trim()) {
        lessonData.content = formData.content_html;
        lessonData.html_content = formData.content_html;
        lessonData.article_content = formData.content_html;
      }

      let result;
      // Check if editing OR if we already created this lesson
      const shouldUpdate = isEditing || createdLessonId;
      const targetLessonId = isEditing ? lessonId : createdLessonId;

      if (shouldUpdate && targetLessonId) {
        console.log('[LessonEditor] Updating lesson:', targetLessonId);
        result = await lessonService.updateLesson(targetLessonId, lessonData);
        if (!result.success) throw new Error(result.error);
        setSuccessMessage('Đã lưu thay đổi');
        setHasUnsavedChanges(false); // Reset for autosave
        setAutoSaveStatus('idle');
        setTimeout(() => setSuccessMessage(''), 2000);

        // Refresh course outline to reflect changes
        await fetchCourseOutline();

        if (!stayOnPage) {
          navigate(`/courses/admin/edit/${courseId}/modules`);
        }
      } else {
        console.log('[LessonEditor] Creating new lesson');
        result = await lessonService.createLesson(lessonData);
        if (!result.success) throw new Error(result.error);

        const newLessonId = result.data?.id;
        console.log('[LessonEditor] Created lesson with id:', newLessonId);

        // Remember this lesson ID to prevent duplicates
        setCreatedLessonId(newLessonId);
        setHasUnsavedChanges(false); // Reset for autosave
        setAutoSaveStatus('idle');
        setSuccessMessage('Đã tạo bài học mới');
        setTimeout(() => setSuccessMessage(''), 2000);

        // Refresh course outline to show new lesson
        await fetchCourseOutline();

        // Navigate to the newly created lesson
        if (stayOnPage && newLessonId) {
          navigate(`/courses/admin/edit/${courseId}/modules/${moduleId}/lessons/${newLessonId}`, { replace: true });
        } else if (!stayOnPage) {
          navigate(`/courses/admin/edit/${courseId}/modules`);
        }
      }
    } catch (err) {
      console.error('[LessonEditor] Save error:', err);
      setError(err.message || 'Không thể lưu bài học');
    } finally {
      setIsSaving(false);
    }
  };

  // Extract video ID from YouTube URL
  const getYouTubeId = (url) => {
    if (!url) return null;
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="lesson-editor-page">
        <div className="editor-loading">
          <Loader2 size={48} className="loading-spinner-icon" />
          <p>Đang tải bài học...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !formData.title && isEditing) {
    return (
      <div className="lesson-editor-page">
        <div className="editor-error">
          <AlertCircle size={48} />
          <h2>{error}</h2>
          <button onClick={() => navigate(`/courses/admin/edit/${courseId}/modules`)} className="btn-back-modules">
            <ArrowLeft size={18} />
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="lesson-editor-page">
      {/* Header */}
      <div className="editor-header">
        <button
          className="btn-back"
          onClick={() => navigate(`/courses/admin/edit/${courseId}/modules`)}
        >
          <ArrowLeft size={20} />
          <span>Quay lại</span>
        </button>

        <div className="header-title">
          <h1 className="editor-title">
            {LESSON_TYPES.find(t => t.value === formData.lesson_type)?.icon &&
              React.createElement(LESSON_TYPES.find(t => t.value === formData.lesson_type).icon, { size: 24 })}
            {isEditing ? 'Chỉnh sửa bài học' : 'Thêm bài học mới'}
          </h1>
          {module && (
            <span className="module-name">Chương: {module.title}</span>
          )}
        </div>

        <div className="editor-actions">
          {/* Autosave indicator */}
          {autoSaveStatus !== 'idle' && (
            <div className={`autosave-indicator ${autoSaveStatus}`}>
              {autoSaveStatus === 'saving' && (
                <>
                  <Loader2 size={14} className="loading-spinner-icon" />
                  <span>Tự lưu...</span>
                </>
              )}
              {autoSaveStatus === 'saved' && (
                <>
                  <Check size={14} />
                  <span>Đã lưu</span>
                </>
              )}
              {autoSaveStatus === 'error' && (
                <>
                  <AlertCircle size={14} />
                  <span>Lỗi lưu</span>
                </>
              )}
            </div>
          )}
          <button
            className="btn-save"
            onClick={() => handleSave(true)}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 size={18} className="loading-spinner-icon" /> : <Save size={18} />}
            Lưu
          </button>
          <button
            className="btn-save-exit"
            onClick={() => handleSave(false)}
            disabled={isSaving}
          >
            Lưu & Thoát
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

      {/* Main Layout with Sidebar */}
      <div className="editor-layout-wrapper">
        {/* Course Navigator - Quick switch between courses */}
        {/* Course Navigator - Full featured with add/reorder/preview */}
        <CourseNavigator
          currentCourseId={courseId}
          currentModuleId={moduleId}
          currentLessonId={lessonId}
          isOpen={courseNavOpen}
          onToggle={() => setCourseNavOpen(!courseNavOpen)}
          position="left"
          mode="full"
          showAllCourses={true}
          onDataChange={fetchCourseOutline}
          onLessonSelect={handleLessonSelect}
        />

        <div className="editor-layout">
        {/* Main Content */}
        <div className="editor-main-content">
          {/* Form - No tabs, images panel moved to right sidebar */}
          <div className="editor-form">
        {/* Content Section - Always visible, no tabs */}
        <div className="content-tab-layout">
          {/* TOP ROW: Settings (Title, Type, Duration, Preview) - Fixed, no scroll */}
          <div className="lesson-settings-row">
            {/* Title */}
            <div className={`setting-group setting-title ${errors.title ? 'has-error' : ''}`}>
              <label className="form-label">
                Tiêu đề bài học <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="VD: Giới thiệu về Candlestick"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                maxLength={200}
              />
              {errors.title && <span className="form-error">{errors.title}</span>}
            </div>

            {/* Lesson Type */}
            <div className="setting-group setting-type">
              <label className="form-label">Loại bài học</label>
              <div className="lesson-type-options">
                {LESSON_TYPES.map((type) => (
                  <label
                    key={type.value}
                    className={`type-option ${formData.lesson_type === type.value ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="lesson_type"
                      value={type.value}
                      checked={formData.lesson_type === type.value}
                      onChange={(e) => handleChange('lesson_type', e.target.value)}
                    />
                    <type.icon size={16} />
                    <div className="type-info">
                      <span className="type-label">{type.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div className="setting-group setting-duration">
              <label className="form-label">Thời lượng</label>
              <div className="duration-input-wrapper">
                <Clock size={16} className="duration-icon" />
                <input
                  type="number"
                  className="form-input with-icon"
                  placeholder="10"
                  value={formData.duration_minutes || ''}
                  onChange={(e) => handleChange('duration_minutes', parseInt(e.target.value) || 0)}
                  min={0}
                  max={999}
                />
                <span className="duration-unit">phút</span>
              </div>
            </div>

            {/* Preview Toggle */}
            <div className="setting-group setting-preview">
              <label className="form-label">Xem trước</label>
              <button
                type="button"
                className={`toggle-btn-compact ${formData.is_preview ? 'active' : ''}`}
                onClick={() => handleChange('is_preview', !formData.is_preview)}
                title={formData.is_preview ? 'Người dùng chưa đăng ký có thể xem' : 'Chỉ học viên đã đăng ký mới xem được'}
              >
                {formData.is_preview ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                <span>{formData.is_preview ? 'Bật' : 'Tắt'}</span>
              </button>
            </div>
          </div>

          {/* BOTTOM ROW: Content Editor + Images Panel - Scrollable */}
          <div className="content-columns">
            {/* Content Editor Column */}
            <div className="content-editor-column">
            {/* Video URL (for video type) */}
            {formData.lesson_type === 'video' && (
              <div className={`form-group ${errors.video_url ? 'has-error' : ''}`}>
                <label className="form-label">
                  URL Video
                </label>
                <div className="url-input-wrapper">
                  <Link size={18} className="url-icon" />
                  <input
                    type="url"
                    className="form-input with-icon"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={formData.video_url}
                    onChange={(e) => handleChange('video_url', e.target.value)}
                  />
                </div>
                {errors.video_url && <span className="form-error">{errors.video_url}</span>}
                <span className="form-hint">Hỗ trợ: YouTube, Vimeo, hoặc link video trực tiếp</span>

                {/* Video Preview */}
                {getYouTubeId(formData.video_url) && (
                  <div className="video-preview">
                    <iframe
                      src={`https://www.youtube.com/embed/${getYouTubeId(formData.video_url)}`}
                      title="Video preview"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>
            )}

            {/* HTML Content (for article type) */}
            {formData.lesson_type === 'article' && (
              <div className={`form-group html-editor-container ${errors.content_html ? 'has-error' : ''} ${isFullscreen ? 'fullscreen' : ''}`}>
                {/* Fullscreen Wrapper - Only visible in fullscreen mode */}
                <div className="fullscreen-wrapper">
                  {/* Fullscreen Header */}
                  <div className="fullscreen-header">
                    <button
                      type="button"
                      className="btn-exit-fullscreen"
                      onClick={toggleFullscreen}
                    >
                      <ArrowLeft size={20} />
                      Thoát Fullscreen
                    </button>
                    <span className="fullscreen-title">Chỉnh sửa HTML - {formData.title || 'Bài học mới'}</span>
                    <div className="html-actions">
                      {/* Undo/Redo buttons */}
                      <button
                        type="button"
                        className="btn-copy-html"
                        onClick={handleUndo}
                        disabled={undoStack.length === 0}
                        title="Hoàn tác (Ctrl+Z)"
                        style={{ opacity: undoStack.length === 0 ? 0.4 : 1 }}
                      >
                        <Undo size={16} />
                      </button>
                      <button
                        type="button"
                        className="btn-copy-html"
                        onClick={handleRedo}
                        disabled={redoStack.length === 0}
                        title="Làm lại (Ctrl+Y)"
                        style={{ opacity: redoStack.length === 0 ? 0.4 : 1 }}
                      >
                        <Redo size={16} />
                      </button>
                      <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.2)', margin: '0 4px' }} />
                      <button type="button" className="btn-copy-html" onClick={handleCopyHtml} title="Copy">
                        <Copy size={16} />
                      </button>
                      <button type="button" className="btn-paste-html" onClick={handlePasteFromClipboard} title="Dán">
                        <ClipboardPaste size={16} />
                      </button>
                      <button
                        type="button"
                        className={`btn-preview-html ${showHtmlPreview ? 'active' : ''}`}
                        onClick={() => { setShowHtmlPreview(!showHtmlPreview); setBlockEditMode(false); }}
                      >
                        {showHtmlPreview ? <Code size={16} /> : <Eye size={16} />}
                        {showHtmlPreview ? 'Code' : 'Preview'}
                      </button>
                      {showHtmlPreview && (
                        <button
                          type="button"
                          className={`btn-block-mode ${blockEditMode ? 'active' : ''}`}
                          onClick={() => setBlockEditMode(!blockEditMode)}
                          title={blockEditMode ? 'WYSIWYG Edit' : 'Kéo thả Block'}
                        >
                          {blockEditMode ? <Eye size={16} /> : <Layers size={16} />}
                          {blockEditMode ? 'WYSIWYG' : 'Blocks'}
                        </button>
                      )}
                      {showHtmlPreview && (
                        <button
                          type="button"
                          className={`btn-mobile-preview ${showMobilePreview ? 'active' : ''}`}
                          onClick={() => setShowMobilePreview(!showMobilePreview)}
                          title="Xem trước trên điện thoại"
                        >
                          <Smartphone size={16} />
                          Mobile
                        </button>
                      )}
                      {showHtmlPreview && (
                        <button
                          type="button"
                          className={`btn-iframe-preview ${iframePreviewMode ? 'active' : ''}`}
                          onClick={() => setIframePreviewMode(!iframePreviewMode)}
                          title="Xem Browser (hiển thị CSS chính xác, không edit được)"
                        >
                          <Globe size={16} />
                          Browser
                        </button>
                      )}
                      <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.2)', margin: '0 4px' }} />
                      {/* Save button */}
                      <button
                        type="button"
                        className="btn-save-exit"
                        onClick={() => handleSave(true)}
                        disabled={isSaving}
                        title="Lưu (Ctrl+S)"
                        style={{ padding: '8px 16px' }}
                      >
                        {isSaving ? <Loader2 size={16} className="loading-spinner-icon" /> : <Save size={16} />}
                        {isSaving ? 'Đang lưu...' : 'Lưu'}
                      </button>
                      <button
                        type="button"
                        className="btn-minimize"
                        onClick={toggleFullscreen}
                        title="Thu nhỏ (Esc)"
                      >
                        <Minimize2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Fullscreen Main - Sidebar + Editor + Images Panel */}
                  <div className={`fullscreen-main ${resizingColumn ? 'resizing' : ''}`}>
                    {/* Course Navigator - Full featured in Fullscreen */}
                    <CourseNavigator
                      currentCourseId={courseId}
                      currentModuleId={moduleId}
                      currentLessonId={lessonId}
                      isOpen={!sidebarCollapsed}
                      onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                      position="left"
                      mode="full"
                      showAllCourses={true}
                      onDataChange={fetchCourseOutline}
                      onLessonSelect={handleLessonSelect}
                    />

                    {/* Toolbox Sidebar - Always visible in fullscreen */}
                    <div
                      className="toolbox-wrapper"
                      style={{
                        width: toolboxCollapsed ? 40 : columnWidths.toolbox,
                        flexShrink: 0,
                        height: '100%',
                        maxHeight: 'calc(100vh - 180px)',
                        position: 'relative',
                      }}
                    >
                      <ToolboxSidebar
                        collapsed={toolboxCollapsed}
                        onToggle={() => setToolboxCollapsed(!toolboxCollapsed)}
                        onAddComponent={(item) => {
                          // Check for special items that trigger modals
                          if (item.isSpecial && item.action === 'openProductPicker') {
                            setShowProductPicker(true);
                            return;
                          }
                          // Add component HTML to content
                          const currentHtml = formData.content_html || '';
                          const newHtml = currentHtml + '\n' + item.html;
                          handleChange('content_html', newHtml);
                        }}
                      />
                    </div>

                    {/* Resize Handle - Toolbox */}
                    {!toolboxCollapsed && (
                      <div
                        className="column-resize-handle toolbox-resize-handle"
                        onMouseDown={(e) => handleResizeStart(e, 'toolbox')}
                        title="Kéo để resize Toolbox"
                      />
                    )}

                    {/* Editor Area */}
                    <div className={`fullscreen-editor-area ${showMobilePreview ? 'with-mobile-preview' : ''}`}>
                      {/* Editor Content Panel */}
                      <div className="editor-content-panel">
                      {/* Toolbar - Always visible */}
                      <div className="html-toolbar">
                        {HTML_TOOLBAR.map((group) => (
                          <div key={group.group} className="toolbar-group">
                            {group.items.map((item) => (
                              <button
                                key={item.id}
                                type="button"
                                className={`toolbar-btn ${item.id === 'undo' && undoStack.length === 0 ? 'disabled' : ''} ${item.id === 'redo' && redoStack.length === 0 ? 'disabled' : ''}`}
                                onClick={() => insertHtmlTag(item)}
                                title={item.title}
                                disabled={(item.id === 'undo' && undoStack.length === 0) || (item.id === 'redo' && redoStack.length === 0)}
                              >
                                <item.icon size={16} />
                              </button>
                            ))}
                          </div>
                        ))}
                      </div>

                      {/* Editor or Preview - Preview is now WYSIWYG editable */}
                      {showHtmlPreview ? (
                        iframePreviewMode ? (
                          /* Iframe Preview - exact browser rendering, no editing */
                          <div className="iframe-preview-container">
                            <div className="iframe-preview-notice">
                              <Globe size={14} />
                              <span>Chế độ xem Browser - CSS hiển thị chính xác, không thể edit</span>
                            </div>
                            <iframe
                              key={`iframe-preview-${lessonId}`}
                              title="Browser Preview"
                              srcDoc={`
                                <!DOCTYPE html>
                                <html>
                                <head>
                                  <meta charset="UTF-8">
                                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                  <style>
                                    * { box-sizing: border-box; }
                                    body {
                                      margin: 0;
                                      padding: 0;
                                      font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
                                      background: linear-gradient(180deg, #0a0f1c 0%, #111827 50%, #0a0f1c 100%);
                                      color: rgba(255, 255, 255, 0.9);
                                      min-height: 100vh;
                                    }
                                  </style>
                                </head>
                                <body>
                                  ${formData.content_html || '<p style="color: rgba(255,255,255,0.5); text-align: center; padding: 20px;">Chưa có nội dung</p>'}
                                </body>
                                </html>
                              `}
                              className="browser-preview-iframe"
                              sandbox="allow-same-origin"
                            />
                          </div>
                        ) : blockEditMode ? (
                          /* Block Drag-and-Drop Editor - Only render in fullscreen mode */
                          isFullscreen && (
                            <DraggableBlockEditor
                              html={formData.content_html}
                              onChange={(newHtml) => handleChange('content_html', newHtml)}
                              onSaveToUndo={forceSaveToUndo}
                              className="fullscreen-block-editor"
                            />
                          )
                        ) : (
                          /* WYSIWYG Editor - NO dangerouslySetInnerHTML to prevent React overwriting user edits */
                          /* innerHTML is managed by useLayoutEffect for full control */
                          <div
                            key={`editor-${lessonId}`}
                            ref={setWysiwygEditorRef}
                            className={`html-preview wysiwyg-editor ${isDraggingOverEditor ? 'drag-over' : ''}`}
                            contentEditable
                            suppressContentEditableWarning
                            onMouseDown={(e) => {
                              // Use mousedown for more reliable element selection
                              const target = e.target;
                              const container = e.currentTarget;

                              // Remove previous selection
                              container.querySelectorAll('.selected-for-delete').forEach(el => {
                                el.classList.remove('selected-for-delete');
                              });

                              // Don't select the container itself
                              if (target !== container) {
                                // For text nodes, select parent element
                                let elementToSelect = target.nodeType === 3 ? target.parentElement : target;

                                // Find meaningful parent (e.g., whole placeholder card instead of icon inside)
                                elementToSelect = findMeaningfulParent(elementToSelect, container);

                                // Select the element
                                if (elementToSelect && elementToSelect !== container) {
                                  elementToSelect.classList.add('selected-for-delete');
                                  selectedElementPathRef.current = getElementPath(elementToSelect, container);
                                  console.log('[Selection] Selected:', elementToSelect.tagName, elementToSelect.className, 'path:', selectedElementPathRef.current);
                                }
                              } else {
                                selectedElementPathRef.current = null;
                                console.log('[Selection] Cleared - clicked on container');
                              }
                            }}
                            onDragStart={(e) => {
                              // Event delegation for dragging images and blocks within editor
                              const target = e.target;
                              const container = e.currentTarget;

                              // Check if dragging an image
                              if (target.tagName === 'IMG') {
                                e.stopPropagation();
                                draggingInternalElementRef.current = target;
                                e.dataTransfer.effectAllowed = 'move';
                                e.dataTransfer.setData('application/x-internal-element', 'true');
                                e.dataTransfer.setData('text/html', target.outerHTML);
                                target.style.opacity = '0.5';
                                console.log('[Drag] Started dragging image:', target.src);
                                return;
                              }

                              // Check if dragging a block element (div with class, section, blockquote, etc.)
                              let blockElement = target;
                              while (blockElement && blockElement !== container) {
                                const isBlock = (
                                  (blockElement.tagName === 'DIV' && blockElement.className) ||
                                  blockElement.tagName === 'SECTION' ||
                                  blockElement.tagName === 'BLOCKQUOTE' ||
                                  blockElement.classList?.contains('info-card') ||
                                  blockElement.classList?.contains('highlight-box') ||
                                  blockElement.classList?.contains('product-recommend-card') ||
                                  blockElement.classList?.contains('product-recommend-banner') ||
                                  blockElement.classList?.contains('product-recommend-inline')
                                );

                                if (isBlock) {
                                  e.stopPropagation();
                                  draggingInternalElementRef.current = blockElement;
                                  e.dataTransfer.effectAllowed = 'move';
                                  e.dataTransfer.setData('application/x-internal-element', 'true');
                                  e.dataTransfer.setData('text/html', blockElement.outerHTML);
                                  blockElement.style.opacity = '0.5';
                                  console.log('[Drag] Started dragging block:', blockElement.tagName, blockElement.className);
                                  return;
                                }
                                blockElement = blockElement.parentElement;
                              }
                            }}
                            onDragEnd={(e) => {
                              // Reset opacity for any dragged element
                              if (draggingInternalElementRef.current) {
                                draggingInternalElementRef.current.style.opacity = '1';
                                draggingInternalElementRef.current = null;
                              }
                            }}
                            onClick={(e) => {
                              // Handle click for element selection and toggle interactions
                              const target = e.target;
                              const container = e.currentTarget;

                              // ═══ TOGGLE/ACCORDION HANDLING ═══
                              // Check if click is on a <summary> element (native HTML5 toggle)
                              let summaryEl = target.closest('summary');
                              if (summaryEl) {
                                const detailsEl = summaryEl.closest('details');
                                if (detailsEl) {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  // Toggle the open attribute
                                  detailsEl.open = !detailsEl.open;
                                  return;
                                }
                              }

                              // ═══ FAQ/TOGGLE DETECTION ═══
                              // Check for .faq-item structure (common FAQ pattern)
                              const faqItem = target.closest('.faq-item');
                              if (faqItem) {
                                // IMPORTANT: Only toggle if clicking on the question part, NOT the answer
                                // This allows editing the answer text without closing the FAQ
                                const faqAnswer = target.closest('.faq-answer');
                                if (faqAnswer) {
                                  // User clicked on answer area - don't toggle, allow editing
                                  return;
                                }

                                // Only toggle if clicking on question or icon
                                const faqQuestion = target.closest('.faq-question');
                                const faqIcon = target.closest('.faq-icon');
                                if (faqQuestion || faqIcon) {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  // Toggle .active class on faq-item
                                  const wasActive = faqItem.classList.contains('active');
                                  // Close all other FAQs in same container
                                  container.querySelectorAll('.faq-item.active').forEach(item => {
                                    item.classList.remove('active');
                                  });
                                  // Toggle current
                                  if (!wasActive) {
                                    faqItem.classList.add('active');
                                  }
                                  return;
                                }
                              }

                              // Check for accordion-item structure
                              const accordionItem = target.closest('.accordion-item');
                              if (accordionItem) {
                                e.preventDefault();
                                e.stopPropagation();
                                accordionItem.classList.toggle('active');
                                return;
                              }

                              // Fallback: Find element with arrow and toggle sibling
                              const arrowRegex = /[▼▶▾▸▲▴◀◂🔽🔼⬇⬆➤►◄▽△]/;
                              let el = target;
                              for (let i = 0; i < 10 && el && el !== container; i++) {
                                if (el.tagName === 'IMG') {
                                  el = el.parentElement;
                                  continue;
                                }
                                const hasArrow = arrowRegex.test(el.textContent || '');
                                const nextSib = el.nextElementSibling;
                                if (hasArrow && nextSib && !arrowRegex.test(nextSib.textContent || '')) {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  // Check if hidden by display, max-height, or class
                                  const style = getComputedStyle(nextSib);
                                  const isHidden = style.display === 'none' ||
                                                   style.maxHeight === '0px' ||
                                                   nextSib.classList.contains('hidden');
                                  if (isHidden) {
                                    nextSib.style.display = '';
                                    nextSib.style.maxHeight = '2000px';
                                    nextSib.classList.remove('hidden');
                                  } else {
                                    nextSib.style.maxHeight = '0px';
                                    nextSib.classList.add('hidden');
                                  }
                                  return;
                                }
                                el = el.parentElement;
                              }

                              // ═══ ELEMENT SELECTION ═══
                              if (target !== container && !target.classList.contains('selected-for-delete')) {
                                container.querySelectorAll('.selected-for-delete').forEach(el => {
                                  el.classList.remove('selected-for-delete');
                                });
                                let elementToSelect = target.nodeType === 3 ? target.parentElement : target;
                                // Find meaningful parent container instead of inner elements
                                elementToSelect = findMeaningfulParent(elementToSelect, container, e);
                                if (elementToSelect && elementToSelect !== container) {
                                  elementToSelect.classList.add('selected-for-delete');
                                  // Save element path to ref (survives re-renders)
                                  selectedElementPathRef.current = getElementPath(elementToSelect, container);
                                }
                              }
                            }}
                            onContextMenu={(e) => {
                              // ═══ RIGHT-CLICK CONTEXT MENU ═══
                              const target = e.target;
                              const container = e.currentTarget;

                              // Find the meaningful parent element to operate on
                              let elementToMenu = target.nodeType === 3 ? target.parentElement : target;
                              elementToMenu = findMeaningfulParent(elementToMenu, container, e);

                              // Don't show menu for the container itself
                              if (!elementToMenu || elementToMenu === container) {
                                return; // Let default context menu show
                              }

                              // Prevent default browser context menu
                              e.preventDefault();
                              e.stopPropagation();

                              // Highlight the element
                              container.querySelectorAll('.selected-for-delete').forEach(el => {
                                el.classList.remove('selected-for-delete');
                              });
                              elementToMenu.classList.add('selected-for-delete');
                              selectedElementPathRef.current = getElementPath(elementToMenu, container);

                              // Show custom context menu
                              setContextMenu({
                                visible: true,
                                x: e.clientX,
                                y: e.clientY,
                                element: elementToMenu
                              });
                            }}
                            onKeyDown={(e) => {
                              // Ctrl+Z for undo
                              if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                                e.preventDefault();
                                handleUndo();
                                return;
                              }
                              // Ctrl+Shift+Z or Ctrl+Y for redo
                              if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                                e.preventDefault();
                                handleRedo();
                                return;
                              }
                              // Delete selected element with Delete key ONLY (not Backspace)
                              // Backspace should work normally for character deletion
                              if (e.key === 'Delete') {
                                let selectedEl = e.currentTarget.querySelector('.selected-for-delete');
                                // If class is gone, try to find by saved path
                                if (!selectedEl && selectedElementPathRef.current) {
                                  selectedEl = getElementByPath(selectedElementPathRef.current, e.currentTarget);
                                }
                                if (selectedEl) {
                                  e.preventDefault();

                                  // ═══ SAVE SCROLL POSITIONS BEFORE DELETE ═══
                                  // This prevents layout shift when element is removed
                                  const editor = e.currentTarget;
                                  const editorScrollTop = editor.scrollTop;
                                  const editorScrollLeft = editor.scrollLeft;
                                  const parentScrollTop = editor.parentElement?.scrollTop || 0;
                                  const windowScrollY = window.scrollY;
                                  const windowScrollX = window.scrollX;

                                  forceSaveToUndo();
                                  selectedEl.remove();
                                  selectedElementPathRef.current = null; // Clear path ref
                                  // Sync changes (mark as internal edit to prevent scroll jump)
                                  const newHtml = editor.innerHTML;
                                  isInternalEditRef.current = true;
                                  lastContentFromEditorRef.current = newHtml;
                                  handleChange('content_html', newHtml);

                                  // ═══ RESTORE SCROLL POSITIONS AFTER DELETE ═══
                                  // Use requestAnimationFrame to restore after React re-render
                                  requestAnimationFrame(() => {
                                    editor.scrollTop = editorScrollTop;
                                    editor.scrollLeft = editorScrollLeft;
                                    if (editor.parentElement) {
                                      editor.parentElement.scrollTop = parentScrollTop;
                                    }
                                    window.scrollTo(windowScrollX, windowScrollY);
                                  });

                                  setSuccessMessage('Đã xóa phần tử');
                                  setTimeout(() => setSuccessMessage(''), 1500);
                                }
                              }
                            }}
                            onDoubleClick={(e) => {
                              // ═══ IMAGE POSITION EDITING ═══
                              // Double-click on an image to edit position/crop
                              const target = e.target;

                              console.log('[DoubleClick Fullscreen] Target:', target.tagName, target.className);

                              // Find image - either the target itself or an image within/near the target
                              let clickedImg = null;

                              if (target.tagName === 'IMG') {
                                clickedImg = target;
                              } else {
                                // Check if clicked on a placeholder that contains an image
                                clickedImg = target.querySelector?.('img') || target.closest?.('.circle-placeholder, .banner-placeholder, .vertical-placeholder, .square-placeholder, .background-placeholder')?.querySelector('img');
                              }

                              console.log('[DoubleClick Fullscreen] Found image:', !!clickedImg);

                              if (clickedImg) {
                                e.preventDefault();
                                e.stopPropagation();

                                // Prevent default text selection behavior
                                window.getSelection?.()?.removeAllRanges?.();

                                setSelectedImageElement(clickedImg);
                                setImagePositionModalOpen(true);
                                console.log('[Image Edit] Opening position modal (fullscreen):', clickedImg.src?.substring(0, 50));
                              }
                            }}
                            onInput={(e) => {
                              // Mark as internal edit to prevent scroll jumps
                              isInternalEditRef.current = true;
                              const newHtml = e.currentTarget.innerHTML;
                              lastContentFromEditorRef.current = newHtml;

                              // IMPORTANT: Also update state to prevent re-render from overwriting DOM
                              // Use debounce to avoid too many state updates
                              if (inputSyncTimerRef.current) {
                                clearTimeout(inputSyncTimerRef.current);
                              }
                              inputSyncTimerRef.current = setTimeout(() => {
                                if (newHtml !== formDataRef.current.content_html) {
                                  setFormData(prev => ({ ...prev, content_html: newHtml }));
                                  setHasUnsavedChanges(true);
                                }
                              }, 300);
                            }}
                            onBlur={(e) => {
                              // Sync changes back to formData when user clicks away
                              const newHtml = e.currentTarget.innerHTML;
                              if (newHtml !== formData.content_html) {
                                isInternalEditRef.current = true;
                                lastContentFromEditorRef.current = newHtml;
                                forceSaveToUndo();
                                handleChange('content_html', newHtml);
                              }
                            }}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              // Allow copy/move operations - use 'copy' for images and toolbox items
                              const isToolbox = e.dataTransfer.types.includes('application/x-toolbox-item');
                              const isImageFromPanel = e.dataTransfer.types.includes('application/json');
                              const isInternalMove = e.dataTransfer.types.includes('application/x-internal-element');
                              e.dataTransfer.dropEffect = isInternalMove ? 'move' : 'copy';
                              setIsDraggingOverEditor(true);
                            }}
                            onDragEnter={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setIsDraggingOverEditor(true);
                              // Restore selection class if it was lost during re-render
                              if (selectedElementPathRef.current && !e.currentTarget.querySelector('.selected-for-delete')) {
                                const selectedEl = getElementByPath(selectedElementPathRef.current, e.currentTarget);
                                if (selectedEl) {
                                  selectedEl.classList.add('selected-for-delete');
                                  console.log('[DragEnter] Restored selection:', selectedEl.tagName, selectedEl.className);
                                }
                              }
                            }}
                            onDragLeave={(e) => {
                              e.preventDefault();
                              // Only set false if leaving the container, not entering a child
                              if (!e.currentTarget.contains(e.relatedTarget)) {
                                setIsDraggingOverEditor(false);
                              }
                            }}
                            onDrop={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setIsDraggingOverEditor(false);

                              const editorElement = e.currentTarget;
                              console.log('[Drop] Received drop event, types:', Array.from(e.dataTransfer.types));
                              console.log('[Drop] selectedElementPathRef:', selectedElementPathRef.current);
                              console.log('[Drop] Selected elements in DOM:', editorElement.querySelectorAll('.selected-for-delete').length);

                              // ═══ 0. Check for Internal Element Move ═══
                              const isInternalMove = e.dataTransfer.getData('application/x-internal-element');
                              if (isInternalMove && draggingInternalElementRef.current) {
                                const draggedElement = draggingInternalElementRef.current;
                                const { target, position } = findDropTarget(e, editorElement);

                                // Don't drop on itself
                                if (target === draggedElement || target?.contains(draggedElement)) {
                                  draggingInternalElementRef.current = null;
                                  return;
                                }

                                forceSaveToUndo();

                                // Remove from original position
                                const parent = draggedElement.parentNode;
                                draggedElement.remove();

                                // Insert at new position
                                if (target && position !== 'inside') {
                                  if (position === 'before') {
                                    target.parentNode.insertBefore(draggedElement, target);
                                  } else {
                                    target.parentNode.insertBefore(draggedElement, target.nextSibling);
                                  }
                                } else {
                                  // Append to editor
                                  editorElement.appendChild(draggedElement);
                                }

                                // Restore opacity
                                draggedElement.style.opacity = '1';

                                // Sync to formData
                                const newHtml = editorElement.innerHTML;
                                isInternalEditRef.current = true;
                                lastContentFromEditorRef.current = newHtml;
                                handleChange('content_html', newHtml);
                                setSuccessMessage('Đã di chuyển phần tử');
                                setTimeout(() => setSuccessMessage(''), 1500);

                                draggingInternalElementRef.current = null;
                                return;
                              }

                              // ═══ 1. Check for Toolbox Component ═══
                              const toolboxData = e.dataTransfer.getData('application/x-toolbox-item');
                              if (toolboxData) {
                                try {
                                  const item = JSON.parse(toolboxData);
                                  if (item.html) {
                                    // Use smart drop to find best insertion point
                                    const { target, position } = findDropTarget(e, editorElement);

                                    // Auto-adapt component background to match parent section
                                    const adaptedHtml = adaptComponentToBackground(item.html, target || editorElement);

                                    forceSaveToUndo();

                                    if (target && position !== 'inside') {
                                      // Insert before/after the target block
                                      const temp = document.createElement('div');
                                      temp.innerHTML = adaptedHtml;
                                      const newElement = temp.firstElementChild || temp.firstChild;

                                      if (newElement) {
                                        if (position === 'before') {
                                          target.parentNode.insertBefore(newElement, target);
                                        } else {
                                          target.parentNode.insertBefore(newElement, target.nextSibling);
                                        }
                                      }
                                    } else {
                                      // Fallback: use caret position for 'inside'
                                      const range = document.caretRangeFromPoint(e.clientX, e.clientY);
                                      if (range) {
                                        const selection = window.getSelection();
                                        selection.removeAllRanges();
                                        selection.addRange(range);
                                        document.execCommand('insertHTML', false, adaptedHtml);
                                      } else {
                                        // Last resort: append to end
                                        editorElement.insertAdjacentHTML('beforeend', adaptedHtml);
                                      }
                                    }

                                    // Sync to formData (mark as internal edit to prevent scroll jump)
                                    const newHtml = editorElement.innerHTML;
                                    isInternalEditRef.current = true;
                                    lastContentFromEditorRef.current = newHtml;
                                    handleChange('content_html', newHtml);
                                    setSuccessMessage(`Đã thêm: ${item.label}`);
                                    setTimeout(() => setSuccessMessage(''), 1500);
                                    return;
                                  }
                                } catch (err) {
                                  console.error('Error parsing toolbox item:', err);
                                }
                              }

                              // ═══ 2. Check for Image from Panel ═══
                              let imageUrl = '';
                              let altText = '';

                              const imageData = e.dataTransfer.getData('application/json');
                              console.log('[Drop] imageData from JSON:', imageData ? imageData.substring(0, 100) : 'null');
                              if (imageData) {
                                try {
                                  const img = JSON.parse(imageData);
                                  imageUrl = img.image_url;
                                  altText = img.alt_text || img.position_id;
                                  console.log('[Drop] Parsed image - URL:', imageUrl?.substring(0, 50));
                                } catch (err) {
                                  console.error('Error parsing image data:', err);
                                }
                              }

                              // ═══ 3. Check for Files from PC ═══
                              if (!imageUrl) {
                                const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
                                if (files.length > 0 && lessonId && lessonId !== 'new') {
                                  const file = files[0];
                                  try {
                                    const positionId = courseImageService.generatePositionId(file.name);
                                    const { data, error } = await courseImageService.uploadAndCreate(file, lessonId, { positionId });
                                    if (error) throw error;
                                    if (data) {
                                      setLessonImages(prev => [...prev, data]);
                                      imageUrl = data.image_url;
                                      altText = data.alt_text || data.position_id;
                                    }
                                  } catch (err) {
                                    setError(`Lỗi upload: ${err.message}`);
                                    return;
                                  }
                                }
                              }

                              // ═══ 4. Insert Image if found ═══
                              if (imageUrl) {
                                const imgHtml = `<img src="${imageUrl}" alt="${altText}" style="width: 100%; max-width: 800px; height: auto; display: block; margin-top: 16px; margin-left: auto; margin-right: auto; margin-bottom: 40px; padding: 0; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.2);" />`;

                                forceSaveToUndo();

                                // ═══ SMART DROP: Detect and replace placeholder/selected element ═══
                                let inserted = false;

                                // Find element under cursor
                                const elementUnderCursor = document.elementFromPoint(e.clientX, e.clientY);

                                // Create new image element
                                const createNewImg = () => {
                                  const newImg = document.createElement('img');
                                  newImg.src = imageUrl;
                                  newImg.alt = altText;
                                  newImg.style.cssText = 'width: 100%; max-width: 800px; height: auto; display: block; margin: 0 auto; padding: 0; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.2);';
                                  return newImg;
                                };

                                // ═══ PRIORITY 1: Check for selected element first (user clicked to highlight) ═══
                                // Try to find by class first, then by stored path (in case class was lost on re-render)
                                let selectedEl = editorElement.querySelector('.selected-for-delete');
                                console.log('[Drop] selectedEl by class:', selectedEl?.tagName, selectedEl?.className);
                                if (!selectedEl && selectedElementPathRef.current) {
                                  selectedEl = getElementByPath(selectedElementPathRef.current, editorElement);
                                  console.log('[Drop] selectedEl by path:', selectedEl?.tagName, selectedEl?.className);
                                }
                                console.log('[Drop] Final selectedEl:', selectedEl ? `${selectedEl.tagName}.${selectedEl.className}` : 'null');
                                if (selectedEl) {
                                  const newImg = createNewImg();

                                  // If selected is an IMG, replace it directly
                                  if (selectedEl.tagName === 'IMG') {
                                    // Copy parent's width/layout constraints
                                    const parent = selectedEl.parentElement;
                                    if (parent && parent.classList?.contains('lesson-image')) {
                                      parent.innerHTML = '';
                                      parent.appendChild(newImg);
                                    } else {
                                      selectedEl.parentNode.replaceChild(newImg, selectedEl);
                                    }
                                    inserted = true;
                                    setSuccessMessage('✅ Đã thay thế hình ảnh đang chọn');
                                  }
                                  // If selected has class lesson-image or any placeholder class
                                  else if (
                                    selectedEl.classList?.contains('lesson-image') ||
                                    selectedEl.classList?.contains('image-placeholder') ||
                                    selectedEl.classList?.contains('video-placeholder') ||
                                    selectedEl.classList?.contains('content-placeholder') ||
                                    selectedEl.classList?.contains('circle-placeholder') ||
                                    selectedEl.classList?.contains('banner-placeholder') ||
                                    selectedEl.classList?.contains('vertical-placeholder') ||
                                    selectedEl.classList?.contains('square-placeholder') ||
                                    selectedEl.classList?.contains('background-placeholder') ||
                                    (selectedEl.className && typeof selectedEl.className === 'string' && selectedEl.className.includes('placeholder'))
                                  ) {
                                    // For circle placeholder - REPLACE with circular image in container+wrapper
                                    if (selectedEl.classList?.contains('circle-placeholder')) {
                                      const size = selectedEl.style.width || '150px';
                                      const container = document.createElement('div');
                                      container.style.cssText = `display: block; width: 100%; text-align: center;`;
                                      const wrapper = document.createElement('div');
                                      wrapper.style.cssText = `width: ${size}; height: ${size}; border-radius: 50%; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.2); display: inline-block; margin: 16px auto 40px auto;`;
                                      wrapper.className = 'circle-image-wrapper';
                                      newImg.style.cssText = `width: 100%; height: 100%; object-fit: cover; display: block;`;
                                      wrapper.appendChild(newImg);
                                      container.appendChild(wrapper);
                                      const spacerDiv = document.createElement('div');
                                      spacerDiv.style.cssText = `display: block; width: 100%; height: 40px; min-height: 40px; line-height: 40px; font-size: 1px; clear: both;`;
                                      spacerDiv.innerHTML = '&nbsp;';
                                      container.appendChild(spacerDiv);
                                      selectedEl.parentNode.replaceChild(container, selectedEl);
                                      inserted = true;
                                      setSuccessMessage('✅ Đã thay thế avatar tròn');
                                    }
                                    // For banner placeholder - REPLACE with 16:9 image in container+wrapper
                                    else if (selectedEl.classList?.contains('banner-placeholder')) {
                                      const maxW = selectedEl.style.maxWidth || '800px';
                                      const container = document.createElement('div');
                                      container.style.cssText = `display: block; width: 100%;`;
                                      const wrapper = document.createElement('div');
                                      wrapper.style.cssText = `width: 100%; max-width: ${maxW}; aspect-ratio: 16/9; overflow: hidden; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.2); display: block; margin: 16px auto 40px auto;`;
                                      wrapper.className = 'banner-image-wrapper';
                                      newImg.style.cssText = `width: 100%; height: 100%; object-fit: cover; display: block;`;
                                      wrapper.appendChild(newImg);
                                      container.appendChild(wrapper);
                                      const spacerDiv = document.createElement('div');
                                      spacerDiv.style.cssText = `display: block; width: 100%; height: 40px; min-height: 40px; line-height: 40px; font-size: 1px; clear: both;`;
                                      spacerDiv.innerHTML = '&nbsp;';
                                      container.appendChild(spacerDiv);
                                      selectedEl.parentNode.replaceChild(container, selectedEl);
                                      inserted = true;
                                      setSuccessMessage('✅ Đã thay thế banner 16:9');
                                    }
                                    // For vertical placeholder - REPLACE with 9:16 image in container+wrapper
                                    else if (selectedEl.classList?.contains('vertical-placeholder')) {
                                      const maxW = selectedEl.style.maxWidth || '450px';
                                      const container = document.createElement('div');
                                      container.style.cssText = `display: block; width: 100%;`;
                                      const wrapper = document.createElement('div');
                                      wrapper.style.cssText = `width: 100%; max-width: ${maxW}; aspect-ratio: 9/16; overflow: hidden; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.2); display: block; margin: 16px auto 40px auto;`;
                                      wrapper.className = 'vertical-image-wrapper';
                                      newImg.style.cssText = `width: 100%; height: 100%; object-fit: cover; display: block;`;
                                      wrapper.appendChild(newImg);
                                      container.appendChild(wrapper);
                                      const spacerDiv = document.createElement('div');
                                      spacerDiv.style.cssText = `display: block; width: 100%; height: 40px; min-height: 40px; line-height: 40px; font-size: 1px; clear: both;`;
                                      spacerDiv.innerHTML = '&nbsp;';
                                      container.appendChild(spacerDiv);
                                      selectedEl.parentNode.replaceChild(container, selectedEl);
                                      inserted = true;
                                      setSuccessMessage('✅ Đã thay thế hình dọc 9:16');
                                    }
                                    // For square placeholder - REPLACE with 1:1 image in container+wrapper
                                    else if (selectedEl.classList?.contains('square-placeholder')) {
                                      const maxW = selectedEl.style.maxWidth || '500px';
                                      const container = document.createElement('div');
                                      container.style.cssText = `display: block; width: 100%;`;
                                      const wrapper = document.createElement('div');
                                      wrapper.style.cssText = `width: 100%; max-width: ${maxW}; aspect-ratio: 1/1; overflow: hidden; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.2); display: block; margin: 16px auto 40px auto;`;
                                      wrapper.className = 'square-image-wrapper';
                                      newImg.style.cssText = `width: 100%; height: 100%; object-fit: cover; display: block;`;
                                      wrapper.appendChild(newImg);
                                      container.appendChild(wrapper);
                                      const spacerDiv = document.createElement('div');
                                      spacerDiv.style.cssText = `display: block; width: 100%; height: 40px; min-height: 40px; line-height: 40px; font-size: 1px; clear: both;`;
                                      spacerDiv.innerHTML = '&nbsp;';
                                      container.appendChild(spacerDiv);
                                      selectedEl.parentNode.replaceChild(container, selectedEl);
                                      inserted = true;
                                      setSuccessMessage('✅ Đã thay thế hình vuông 1:1');
                                    }
                                    // For background placeholder - REPLACE with background section
                                    else if (selectedEl.classList?.contains('background-placeholder')) {
                                      const minH = selectedEl.style.minHeight || '400px';
                                      const section = document.createElement('section');
                                      section.className = 'background-section';
                                      section.style.cssText = `position: relative; width: 100%; min-height: ${minH}; background-image: url('${imageData.image_url}'); background-size: cover; background-position: center; background-repeat: no-repeat; border-radius: 16px; overflow: hidden; margin: 16px 0 40px 0;`;
                                      // Add dark overlay for readability
                                      const overlay = document.createElement('div');
                                      overlay.className = 'background-overlay';
                                      overlay.style.cssText = `position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 100%); z-index: 1;`;
                                      section.appendChild(overlay);
                                      // Add content area
                                      const content = document.createElement('div');
                                      content.className = 'background-content';
                                      content.style.cssText = `position: relative; z-index: 2; padding: 60px 40px; text-align: center;`;
                                      content.innerHTML = '<h2 style="color: #fff; font-size: 2rem; font-weight: 700; margin-bottom: 16px; text-shadow: 0 2px 8px rgba(0,0,0,0.5);">Tiêu đề Section</h2><p style="color: rgba(255,255,255,0.9); font-size: 1.1rem; max-width: 600px; margin: 0 auto;">Mô tả nội dung của section này. Chỉnh sửa text này theo ý muốn.</p>';
                                      section.appendChild(content);
                                      // Add container with spacer
                                      const container = document.createElement('div');
                                      container.appendChild(section);
                                      const spacerDiv = document.createElement('div');
                                      spacerDiv.style.cssText = `display: block; width: 100%; height: 40px; min-height: 40px; line-height: 40px; font-size: 1px; clear: both;`;
                                      spacerDiv.innerHTML = '&nbsp;';
                                      container.appendChild(spacerDiv);
                                      selectedEl.parentNode.replaceChild(container, selectedEl);
                                      inserted = true;
                                      setSuccessMessage('✅ Đã thay thế background section');
                                    }
                                    // For other placeholders
                                    else {
                                      selectedEl.parentNode.replaceChild(newImg, selectedEl);
                                      inserted = true;
                                      setSuccessMessage('✅ Đã thay thế placeholder đang chọn');
                                    }
                                  }
                                  // Otherwise replace the selected element
                                  else {
                                    selectedEl.parentNode.replaceChild(newImg, selectedEl);
                                    inserted = true;
                                    setSuccessMessage('✅ Đã thay thế element đang chọn');
                                  }
                                }

                                // ═══ PRIORITY 2: Check element under cursor ═══
                                if (!inserted && elementUnderCursor && elementUnderCursor !== editorElement) {
                                  // If dropping directly on an IMG element
                                  if (elementUnderCursor.tagName === 'IMG') {
                                    const newImg = createNewImg();
                                    const parent = elementUnderCursor.parentElement;
                                    if (parent && parent.classList?.contains('lesson-image')) {
                                      parent.innerHTML = '';
                                      parent.appendChild(newImg);
                                    } else {
                                      elementUnderCursor.parentNode.replaceChild(newImg, elementUnderCursor);
                                    }
                                    inserted = true;
                                    setSuccessMessage('✅ Đã thay thế hình ảnh');
                                  }
                                  // If dropping on lesson-image wrapper (placeholder)
                                  else {
                                    let current = elementUnderCursor;
                                    let maxDepth = 10;
                                    while (current && maxDepth > 0 && current !== editorElement) {
                                      // Check for any placeholder class
                                      const isPlaceholder =
                                        current.classList?.contains('lesson-image') ||
                                        current.classList?.contains('image-placeholder') ||
                                        current.classList?.contains('video-placeholder') ||
                                        current.classList?.contains('content-placeholder') ||
                                        current.classList?.contains('circle-placeholder') ||
                                        current.classList?.contains('banner-placeholder') ||
                                        current.classList?.contains('vertical-placeholder') ||
                                        current.classList?.contains('square-placeholder') ||
                                        current.classList?.contains('background-placeholder') ||
                                        (current.className && typeof current.className === 'string' && current.className.includes('placeholder'));

                                      if (isPlaceholder) {
                                        const newImg = createNewImg();
                                        // For circle placeholder - REPLACE with circular image in wrapper
                                        if (current.classList?.contains('circle-placeholder')) {
                                          const size = current.style.width || '150px';
                                          // Create container for Shopify compatibility
                                          const container = document.createElement('div');
                                          container.style.cssText = `display: block; width: 100%; text-align: center;`;
                                          // Create circular wrapper with margin-bottom
                                          const wrapper = document.createElement('div');
                                          wrapper.style.cssText = `width: ${size}; height: ${size}; border-radius: 50%; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.2); display: inline-block; margin: 16px auto 40px auto;`;
                                          wrapper.className = 'circle-image-wrapper';
                                          newImg.style.cssText = `width: 100%; height: 100%; object-fit: cover; display: block;`;
                                          wrapper.appendChild(newImg);
                                          container.appendChild(wrapper);
                                          // Add spacer div as backup for Shopify
                                          const spacerDiv = document.createElement('div');
                                          spacerDiv.style.cssText = `display: block; width: 100%; height: 40px; min-height: 40px; line-height: 40px; font-size: 1px; clear: both;`;
                                          spacerDiv.innerHTML = '&nbsp;';
                                          container.appendChild(spacerDiv);
                                          current.parentNode.replaceChild(container, current);
                                          inserted = true;
                                          setSuccessMessage('✅ Đã thay thế avatar tròn');
                                          break;
                                        }
                                        // For banner placeholder - REPLACE with 16:9 image in wrapper
                                        if (current.classList?.contains('banner-placeholder')) {
                                          const maxW = current.style.maxWidth || '800px';
                                          // Create container for Shopify compatibility
                                          const container = document.createElement('div');
                                          container.style.cssText = `display: block; width: 100%;`;
                                          // Create banner wrapper with margin-bottom
                                          const wrapper = document.createElement('div');
                                          wrapper.style.cssText = `width: 100%; max-width: ${maxW}; aspect-ratio: 16/9; overflow: hidden; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.2); display: block; margin: 16px auto 40px auto;`;
                                          wrapper.className = 'banner-image-wrapper';
                                          newImg.style.cssText = `width: 100%; height: 100%; object-fit: cover; display: block;`;
                                          wrapper.appendChild(newImg);
                                          container.appendChild(wrapper);
                                          // Add spacer div as backup for Shopify
                                          const spacerDiv = document.createElement('div');
                                          spacerDiv.style.cssText = `display: block; width: 100%; height: 40px; min-height: 40px; line-height: 40px; font-size: 1px; clear: both;`;
                                          spacerDiv.innerHTML = '&nbsp;';
                                          container.appendChild(spacerDiv);
                                          current.parentNode.replaceChild(container, current);
                                          inserted = true;
                                          setSuccessMessage('✅ Đã thay thế banner 16:9');
                                          break;
                                        }
                                        // For vertical placeholder - REPLACE with 9:16 image in wrapper
                                        if (current.classList?.contains('vertical-placeholder')) {
                                          const maxW = current.style.maxWidth || '450px';
                                          const container = document.createElement('div');
                                          container.style.cssText = `display: block; width: 100%;`;
                                          const wrapper = document.createElement('div');
                                          wrapper.style.cssText = `width: 100%; max-width: ${maxW}; aspect-ratio: 9/16; overflow: hidden; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.2); display: block; margin: 16px auto 40px auto;`;
                                          wrapper.className = 'vertical-image-wrapper';
                                          newImg.style.cssText = `width: 100%; height: 100%; object-fit: cover; display: block;`;
                                          wrapper.appendChild(newImg);
                                          container.appendChild(wrapper);
                                          const spacerDiv = document.createElement('div');
                                          spacerDiv.style.cssText = `display: block; width: 100%; height: 40px; min-height: 40px; line-height: 40px; font-size: 1px; clear: both;`;
                                          spacerDiv.innerHTML = '&nbsp;';
                                          container.appendChild(spacerDiv);
                                          current.parentNode.replaceChild(container, current);
                                          inserted = true;
                                          setSuccessMessage('✅ Đã thay thế hình dọc 9:16');
                                          break;
                                        }
                                        // For square placeholder - REPLACE with 1:1 image in wrapper
                                        if (current.classList?.contains('square-placeholder')) {
                                          const maxW = current.style.maxWidth || '500px';
                                          const container = document.createElement('div');
                                          container.style.cssText = `display: block; width: 100%;`;
                                          const wrapper = document.createElement('div');
                                          wrapper.style.cssText = `width: 100%; max-width: ${maxW}; aspect-ratio: 1/1; overflow: hidden; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.2); display: block; margin: 16px auto 40px auto;`;
                                          wrapper.className = 'square-image-wrapper';
                                          newImg.style.cssText = `width: 100%; height: 100%; object-fit: cover; display: block;`;
                                          wrapper.appendChild(newImg);
                                          container.appendChild(wrapper);
                                          const spacerDiv = document.createElement('div');
                                          spacerDiv.style.cssText = `display: block; width: 100%; height: 40px; min-height: 40px; line-height: 40px; font-size: 1px; clear: both;`;
                                          spacerDiv.innerHTML = '&nbsp;';
                                          container.appendChild(spacerDiv);
                                          current.parentNode.replaceChild(container, current);
                                          inserted = true;
                                          setSuccessMessage('✅ Đã thay thế hình vuông 1:1');
                                          break;
                                        }
                                        // For background placeholder - REPLACE with background section
                                        if (current.classList?.contains('background-placeholder')) {
                                          const section = document.createElement('section');
                                          section.className = 'background-section';
                                          section.style.cssText = `position: relative; width: 100%; min-height: 400px; background-image: url('${imageData.image_url}'); background-size: cover; background-position: center; background-repeat: no-repeat; border-radius: 16px; overflow: hidden; margin: 16px 0 40px 0;`;
                                          // Add dark overlay
                                          const overlay = document.createElement('div');
                                          overlay.className = 'background-overlay';
                                          overlay.style.cssText = `position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 100%); z-index: 1;`;
                                          section.appendChild(overlay);
                                          // Add content area
                                          const content = document.createElement('div');
                                          content.className = 'background-content';
                                          content.style.cssText = `position: relative; z-index: 2; padding: 60px 40px; text-align: center;`;
                                          content.innerHTML = '<h2 style="color: #fff; font-size: 2rem; font-weight: 700; margin-bottom: 16px; text-shadow: 0 2px 8px rgba(0,0,0,0.5);">Tiêu đề Section</h2><p style="color: rgba(255,255,255,0.9); font-size: 1.1rem; max-width: 600px; margin: 0 auto;">Mô tả nội dung của section này. Chỉnh sửa text này theo ý muốn.</p>';
                                          section.appendChild(content);
                                          // Add spacer
                                          const container = document.createElement('div');
                                          container.appendChild(section);
                                          const spacerDiv = document.createElement('div');
                                          spacerDiv.style.cssText = `display: block; width: 100%; height: 40px; min-height: 40px; line-height: 40px; font-size: 1px; clear: both;`;
                                          spacerDiv.innerHTML = '&nbsp;';
                                          container.appendChild(spacerDiv);
                                          current.parentNode.replaceChild(container, current);
                                          inserted = true;
                                          setSuccessMessage('✅ Đã thay thế background section');
                                          break;
                                        }
                                        // For other placeholders
                                        current.parentNode.replaceChild(newImg, current);
                                        inserted = true;
                                        setSuccessMessage('✅ Đã thay thế placeholder');
                                        break;
                                      }
                                      // Check for dashed border placeholder by text content
                                      const text = current.textContent || '';
                                      if (text.includes('Kéo thả hình') || text.includes('🖼️') || text.includes('👤') || text.includes('Banner')) {
                                        const newImg = createNewImg();

                                        // Circle placeholder detected by 👤 emoji
                                        if (text.includes('👤') || current.style.borderRadius === '50%') {
                                          const size = current.style.width || '150px';
                                          const container = document.createElement('div');
                                          container.style.cssText = `display: block; width: 100%; text-align: center;`;
                                          const wrapper = document.createElement('div');
                                          wrapper.style.cssText = `width: ${size}; height: ${size}; border-radius: 50%; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.2); display: inline-block; margin: 16px auto 40px auto;`;
                                          wrapper.className = 'circle-image-wrapper';
                                          newImg.style.cssText = `width: 100%; height: 100%; object-fit: cover; display: block;`;
                                          wrapper.appendChild(newImg);
                                          container.appendChild(wrapper);
                                          const spacerDiv = document.createElement('div');
                                          spacerDiv.style.cssText = `display: block; width: 100%; height: 40px; min-height: 40px; line-height: 40px; font-size: 1px; clear: both;`;
                                          spacerDiv.innerHTML = '&nbsp;';
                                          container.appendChild(spacerDiv);
                                          current.parentNode.replaceChild(container, current);
                                          inserted = true;
                                          setSuccessMessage('✅ Đã thay thế avatar tròn');
                                          break;
                                        }
                                        // Banner placeholder detected by Banner text or 16:9 aspect
                                        else if (text.includes('Banner') || text.includes('16:9') || current.style.aspectRatio === '16/9' || current.style.aspectRatio === '16 / 9') {
                                          const maxW = current.style.maxWidth || '800px';
                                          const container = document.createElement('div');
                                          container.style.cssText = `display: block; width: 100%;`;
                                          const wrapper = document.createElement('div');
                                          wrapper.style.cssText = `width: 100%; max-width: ${maxW}; aspect-ratio: 16/9; overflow: hidden; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.2); display: block; margin: 16px auto 40px auto;`;
                                          wrapper.className = 'banner-image-wrapper';
                                          newImg.style.cssText = `width: 100%; height: 100%; object-fit: cover; display: block;`;
                                          wrapper.appendChild(newImg);
                                          container.appendChild(wrapper);
                                          const spacerDiv = document.createElement('div');
                                          spacerDiv.style.cssText = `display: block; width: 100%; height: 40px; min-height: 40px; line-height: 40px; font-size: 1px; clear: both;`;
                                          spacerDiv.innerHTML = '&nbsp;';
                                          container.appendChild(spacerDiv);
                                          current.parentNode.replaceChild(container, current);
                                          inserted = true;
                                          setSuccessMessage('✅ Đã thay thế banner 16:9');
                                          break;
                                        }
                                        // Other placeholders
                                        else {
                                          if (current.parentElement?.classList?.contains('lesson-image')) {
                                            current.parentElement.innerHTML = '';
                                            current.parentElement.appendChild(newImg);
                                          } else {
                                            current.parentNode.replaceChild(newImg, current);
                                          }
                                          inserted = true;
                                          setSuccessMessage('✅ Đã thay thế placeholder');
                                          break;
                                        }
                                      }
                                      current = current.parentElement;
                                      maxDepth--;
                                    }
                                  }
                                }

                                // Fallback: Try caretRangeFromPoint
                                if (!inserted) {
                                  const range = document.caretRangeFromPoint(e.clientX, e.clientY);
                                  if (range && editorElement.contains(range.startContainer)) {
                                    const selection = window.getSelection();
                                    selection.removeAllRanges();
                                    selection.addRange(range);
                                    document.execCommand('insertHTML', false, imgHtml);
                                    inserted = true;
                                    setSuccessMessage('Đã chèn hình tại vị trí thả');
                                  }
                                }

                                // Last fallback: append to editor
                                if (!inserted) {
                                  editorElement.insertAdjacentHTML('beforeend', imgHtml);
                                  setSuccessMessage('Đã chèn hình ảnh');
                                }

                                // Clear any selection
                                const selectedElFinal = editorElement.querySelector('.selected-for-delete');
                                if (selectedElFinal) selectedElFinal.classList.remove('selected-for-delete');
                                selectedElementPathRef.current = null;

                                // Sync to formData
                                const newHtml = editorElement.innerHTML;
                                isInternalEditRef.current = true;
                                lastContentFromEditorRef.current = newHtml;
                                handleChange('content_html', newHtml);
                                setTimeout(() => setSuccessMessage(''), 1500);
                              }
                            }}
                          />
                        )
                      ) : (
                        <textarea
                          ref={textareaRef}
                          className={`form-textarea code-editor ${isDraggingOverEditor ? 'drag-over' : ''}`}
                          placeholder="<h2>Tiêu đề</h2>&#10;<p>Nội dung bài học...</p>&#10;&#10;Kéo thả hình ảnh vào đây để chèn..."
                          value={formData.content_html}
                          onChange={(e) => handleChange('content_html', e.target.value)}
                          onKeyDown={(e) => {
                            // Ctrl+Z for undo
                            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                              e.preventDefault();
                              handleUndo();
                              return;
                            }
                            // Ctrl+Shift+Z or Ctrl+Y for redo
                            if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                              e.preventDefault();
                              handleRedo();
                              return;
                            }
                          }}
                          onPaste={handlePaste}
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDraggingOverEditor(true);
                          }}
                          onDragLeave={(e) => {
                            e.preventDefault();
                            setIsDraggingOverEditor(false);
                          }}
                          onDrop={handleEditorDrop}
                          spellCheck={false}
                        />
                      )}
                      </div>
                      {/* End of editor-content-panel */}

                      {/* Resize Handle - Before Mobile Preview */}
                      {showMobilePreview && (
                        <div
                          className="column-resize-handle"
                          onMouseDown={(e) => handleResizeStart(e, 'mobilePreview')}
                          title="Kéo để resize"
                        />
                      )}

                      {/* Mobile Preview Panel */}
                      {showMobilePreview && (
                        <div
                          className="mobile-preview-panel"
                          style={{ width: columnWidths.mobilePreview }}
                        >
                          <MobilePreviewFrame
                            htmlContent={formData.content_html}
                            onClose={() => setShowMobilePreview(false)}
                          />
                        </div>
                      )}
                    </div>

                    {/* Resize Handle - Before Images Panel */}
                    <div
                      className="column-resize-handle"
                      onMouseDown={(e) => handleResizeStart(e, 'imagePanel')}
                      title="Kéo để resize"
                    />

                    {/* Images Panel with Drag-Drop - Entire panel is drop zone */}
                    <div
                      className={`fullscreen-images-panel ${isDraggingFile ? 'panel-dragging' : ''}`}
                      style={{ width: columnWidths.imagePanel }}
                      onDragEnter={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDraggingFile(true);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.dataTransfer.dropEffect = 'copy';
                        setIsDraggingFile(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Only set false if leaving the panel entirely
                        const rect = e.currentTarget.getBoundingClientRect();
                        const isOutside = e.clientX < rect.left || e.clientX > rect.right ||
                                         e.clientY < rect.top || e.clientY > rect.bottom;
                        if (isOutside) {
                          setIsDraggingFile(false);
                        }
                      }}
                      onDrop={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDraggingFile(false);
                        console.log('[ImagePanel] Drop received');

                        if (!lessonId || lessonId === 'new') {
                          setError('Lưu bài học trước khi upload hình');
                          return;
                        }

                        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
                        console.log('[ImagePanel] Files to upload:', files.length);
                        if (files.length === 0) {
                          console.log('[ImagePanel] No image files found in drop');
                          return;
                        }

                        setSuccessMessage(`Đang upload ${files.length} hình...`);

                        for (const file of files) {
                          try {
                            const positionId = courseImageService.generatePositionId(file.name);
                            const { data, error } = await courseImageService.uploadAndCreate(file, lessonId, { positionId });
                            if (error) throw error;
                            if (data) {
                              setLessonImages(prev => [...prev, data]);
                              setSuccessMessage(`Đã upload: ${file.name}`);
                            }
                          } catch (err) {
                            console.error('Upload error:', err);
                            setError(`Lỗi upload: ${err.message}`);
                          }
                        }
                        setTimeout(() => setSuccessMessage(''), 2000);
                      }}
                    >
                      <div className="images-panel-header">
                        <h4>
                          <Image size={16} />
                          Hình ảnh
                          {lessonImages.length > 0 && <span className="badge">{lessonImages.length}</span>}
                        </h4>
                        <div className="images-panel-actions">
                          {/* Sort dropdown */}
                          <select
                            className="sort-select"
                            value={imageSortOrder}
                            onChange={(e) => setImageSortOrder(e.target.value)}
                            title="Sắp xếp"
                          >
                            <option value="newest">Mới nhất</option>
                            <option value="oldest">Cũ nhất</option>
                            <option value="name">Tên A-Z</option>
                          </select>
                          {lessonId && lessonId !== 'new' && (
                            <button
                              type="button"
                              onClick={fetchLessonImages}
                              className="btn-refresh-images"
                              title="Tải lại"
                            >
                              {imagesLoading ? <Loader2 size={12} className="animate-spin" /> : 'Tải lại'}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Upload indicator */}
                      {isDraggingFile && (
                        <div className="drop-overlay">
                          <Upload size={32} />
                          <span>Thả để upload</span>
                        </div>
                      )}

                      {/* Images List */}
                      <div className="images-panel-list">
                        {imagesLoading ? (
                          <div className="images-panel-empty">
                            <Loader2 size={24} className="animate-spin" style={{ marginBottom: '8px' }} />
                            <p>Đang tải...</p>
                          </div>
                        ) : sortedImages.length === 0 ? (
                          <div className="images-panel-empty">
                            <Upload size={32} style={{ opacity: 0.5, marginBottom: '8px' }} />
                            <p>Kéo thả hình vào đây</p>
                            <p style={{ fontSize: '10px', marginTop: '4px', opacity: 0.6 }}>
                              {!lessonId || lessonId === 'new' ? 'Lưu bài học trước' : 'PNG, JPG, GIF, WebP'}
                            </p>
                          </div>
                        ) : (
                          sortedImages.map((img) => {
                            const htmlTag = `<img src="${img.image_url}" alt="${img.alt_text || img.position_id}" />`;
                            const isCopied = copiedImageId === img.id;
                            return (
                              <div
                                key={img.id}
                                className="image-panel-item draggable-image"
                                draggable
                                onDragStart={(e) => {
                                  e.dataTransfer.setData('application/json', JSON.stringify(img));
                                  e.dataTransfer.effectAllowed = 'copy';
                                }}
                                title="Kéo thả vào editor để chèn"
                              >
                                <div
                                  className="image-panel-thumb"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setLightboxImage(img);
                                  }}
                                  style={{ cursor: 'zoom-in' }}
                                >
                                  <img src={img.image_url} alt={img.position_id} draggable={false} />
                                  <div className="image-zoom-overlay">
                                    <Eye size={20} />
                                  </div>
                                </div>
                                <div className="image-panel-info">
                                  <div className="image-panel-id">{img.position_id}</div>
                                  <div className="image-panel-actions" style={{ marginTop: '6px' }}>
                                    <button
                                      type="button"
                                      className={`btn-copy-img ${isCopied ? 'copied' : ''}`}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        navigator.clipboard.writeText(htmlTag).then(() => {
                                          setCopiedImageId(img.id);
                                          setTimeout(() => setCopiedImageId(null), 1500);
                                        }).catch(err => {
                                          console.error('Copy failed:', err);
                                          setError('Không thể copy');
                                        });
                                      }}
                                    >
                                      {isCopied ? <Check size={12} /> : <Copy size={12} />}
                                      {isCopied ? 'Đã copy!' : 'Copy HTML'}
                                    </button>
                                    <button
                                      type="button"
                                      className="btn-download-img"
                                      onClick={async (e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        try {
                                          const response = await fetch(img.image_url);
                                          const blob = await response.blob();
                                          const url = window.URL.createObjectURL(blob);
                                          const a = document.createElement('a');
                                          a.href = url;
                                          a.download = img.position_id || 'image';
                                          document.body.appendChild(a);
                                          a.click();
                                          window.URL.revokeObjectURL(url);
                                          document.body.removeChild(a);
                                          setSuccessMessage('Đang tải về...');
                                          setTimeout(() => setSuccessMessage(''), 1500);
                                        } catch (err) {
                                          console.error('Download failed:', err);
                                          setError('Không thể tải về');
                                        }
                                      }}
                                      title="Tải về"
                                    >
                                      <Download size={12} />
                                    </button>
                                    <button
                                      type="button"
                                      className="btn-delete-img"
                                      onClick={async (e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (!window.confirm(`Xóa hình "${img.position_id}"?`)) return;
                                        try {
                                          const { error } = await courseImageService.delete(img.id);
                                          if (error) throw error;
                                          setLessonImages(prev => prev.filter(i => i.id !== img.id));
                                          setSuccessMessage('Đã xóa hình ảnh');
                                          setTimeout(() => setSuccessMessage(''), 2000);
                                        } catch (err) {
                                          setError(`Lỗi xóa: ${err.message}`);
                                        }
                                      }}
                                      title="Xóa hình ảnh"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Fullscreen Footer */}
                  <div className="fullscreen-footer">
                    <span className="char-count">{formData.content_html.length} ký tự</span>
                    <span className="editor-hint">Ctrl+Z: Hoàn tác | Ctrl+V: Dán</span>
                  </div>
                </div>

                {/* Normal mode content (hidden in fullscreen) */}
                <div className="normal-mode-wrapper">
                  <div className="form-label-row">
                    <label className="form-label">
                      Nội dung HTML <span className="required">*</span>
                    </label>
                    <div className="html-actions">
                      <button
                        type="button"
                        className="btn-import-html"
                        onClick={() => htmlInputRef.current?.click()}
                        title="Import từ file HTML"
                      >
                        <FileUp size={16} />
                        Import
                      </button>
                      <input
                        ref={htmlInputRef}
                        type="file"
                        accept=".html,.htm"
                        onChange={handleHtmlImport}
                        hidden
                      />
                      <button
                        type="button"
                        className="btn-sanitize-html"
                        onClick={handleReSanitize}
                        title="Xóa background/orb elements và sửa CSS có vấn đề"
                      >
                        <Sparkles size={16} />
                        Clean
                      </button>
                      <button
                        type="button"
                        className="btn-copy-html"
                        onClick={handleCopyHtml}
                        title="Copy nội dung"
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        type="button"
                        className="btn-paste-html"
                        onClick={handlePasteFromClipboard}
                        title="Dán từ clipboard"
                      >
                        <ClipboardPaste size={16} />
                      </button>
                      <button
                        type="button"
                        className={`btn-preview-html ${showHtmlPreview ? 'active' : ''}`}
                        onClick={() => { setShowHtmlPreview(!showHtmlPreview); setBlockEditMode(false); }}
                      >
                        {showHtmlPreview ? <Code size={16} /> : <Eye size={16} />}
                        {showHtmlPreview ? 'Code' : 'Preview'}
                      </button>
                      {showHtmlPreview && (
                        <button
                          type="button"
                          className={`btn-block-mode ${blockEditMode ? 'active' : ''}`}
                          onClick={() => setBlockEditMode(!blockEditMode)}
                          title={blockEditMode ? 'WYSIWYG Edit' : 'Kéo thả Block'}
                        >
                          {blockEditMode ? <Eye size={16} /> : <Layers size={16} />}
                          {blockEditMode ? 'WYSIWYG' : 'Blocks'}
                        </button>
                      )}
                      {showHtmlPreview && (
                        <button
                          type="button"
                          className="btn-product-picker"
                          onClick={() => setShowProductPicker(true)}
                          title="Thêm sản phẩm từ Shop"
                          style={{
                            background: 'linear-gradient(135deg, rgba(106, 91, 255, 0.3), rgba(0, 240, 255, 0.2))',
                            border: '1px solid rgba(0, 240, 255, 0.4)',
                          }}
                        >
                          <ShoppingBag size={16} />
                          Sản Phẩm
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn-fullscreen"
                        onClick={toggleFullscreen}
                        title="Toàn màn hình"
                      >
                        <Maximize2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* HTML Toolbar - Always visible */}
                  <div className="html-toolbar">
                    {HTML_TOOLBAR.map((group) => (
                      <div key={group.group} className="toolbar-group">
                        {group.items.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            className={`toolbar-btn ${item.id === 'undo' && undoStack.length === 0 ? 'disabled' : ''} ${item.id === 'redo' && redoStack.length === 0 ? 'disabled' : ''}`}
                            onClick={() => insertHtmlTag(item)}
                            title={item.title}
                            disabled={(item.id === 'undo' && undoStack.length === 0) || (item.id === 'redo' && redoStack.length === 0)}
                          >
                            <item.icon size={16} />
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>

                  {showHtmlPreview ? (
                    blockEditMode ? (
                      /* Block Drag-and-Drop Editor - Only render in normal mode */
                      !isFullscreen && (
                        <DraggableBlockEditor
                          html={formData.content_html}
                          onChange={(newHtml) => handleChange('content_html', newHtml)}
                          onSaveToUndo={forceSaveToUndo}
                          className="normal-block-editor"
                        />
                      )
                    ) : (
                      /* WYSIWYG Editor - Non-fullscreen mode */
                      /* NO dangerouslySetInnerHTML - innerHTML managed by useLayoutEffect */
                      <div
                        key={`editor2-${lessonId}`}
                        ref={setWysiwygEditorRef2}
                        className={`html-preview wysiwyg-editor ${isDraggingOverEditor ? 'drag-over' : ''}`}
                        contentEditable
                        suppressContentEditableWarning
                        onMouseDown={(e) => {
                          const target = e.target;
                          const container = e.currentTarget;
                          container.querySelectorAll('.selected-for-delete').forEach(el => {
                            el.classList.remove('selected-for-delete');
                          });
                          if (target !== container) {
                            let elementToSelect = target.nodeType === 3 ? target.parentElement : target;
                            // Find meaningful parent container instead of inner elements
                            elementToSelect = findMeaningfulParent(elementToSelect, container, e);
                            if (elementToSelect && elementToSelect !== container) {
                              elementToSelect.classList.add('selected-for-delete');
                              selectedElementPathRef.current = getElementPath(elementToSelect, container);
                              console.log('[Preview] Selected:', elementToSelect.tagName, 'path:', selectedElementPathRef.current);
                            }
                          } else {
                            selectedElementPathRef.current = null;
                          }
                        }}
                        onDragStart={(e) => {
                          // Event delegation for dragging images and blocks within editor
                          const target = e.target;
                          const container = e.currentTarget;

                          // Check if dragging an image
                          if (target.tagName === 'IMG') {
                            e.stopPropagation();
                            draggingInternalElementRef.current = target;
                            e.dataTransfer.effectAllowed = 'move';
                            e.dataTransfer.setData('application/x-internal-element', 'true');
                            e.dataTransfer.setData('text/html', target.outerHTML);
                            target.style.opacity = '0.5';
                            console.log('[Drag] Started dragging image:', target.src);
                            return;
                          }

                          // Check if dragging a block element (div with class, section, blockquote, etc.)
                          let blockElement = target;
                          while (blockElement && blockElement !== container) {
                            const isBlock = (
                              (blockElement.tagName === 'DIV' && blockElement.className) ||
                              blockElement.tagName === 'SECTION' ||
                              blockElement.tagName === 'BLOCKQUOTE' ||
                              blockElement.classList?.contains('info-card') ||
                              blockElement.classList?.contains('highlight-box') ||
                              blockElement.classList?.contains('product-recommend-card') ||
                              blockElement.classList?.contains('product-recommend-banner') ||
                              blockElement.classList?.contains('product-recommend-inline')
                            );

                            if (isBlock) {
                              e.stopPropagation();
                              draggingInternalElementRef.current = blockElement;
                              e.dataTransfer.effectAllowed = 'move';
                              e.dataTransfer.setData('application/x-internal-element', 'true');
                              e.dataTransfer.setData('text/html', blockElement.outerHTML);
                              blockElement.style.opacity = '0.5';
                              console.log('[Drag] Started dragging block:', blockElement.tagName, blockElement.className);
                              return;
                            }
                            blockElement = blockElement.parentElement;
                          }
                        }}
                        onDragEnd={(e) => {
                          // Reset opacity for any dragged element
                          if (draggingInternalElementRef.current) {
                            draggingInternalElementRef.current.style.opacity = '1';
                            draggingInternalElementRef.current = null;
                          }
                        }}
                        onClick={(e) => {
                          // Handle click for element selection and toggle interactions
                          const target = e.target;
                          const container = e.currentTarget;

                          // ═══ TOGGLE/ACCORDION HANDLING ═══
                          // Check if click is on a <summary> element (native HTML5 toggle)
                          let summaryEl = target.closest('summary');
                          if (summaryEl) {
                            const detailsEl = summaryEl.closest('details');
                            if (detailsEl) {
                              e.preventDefault();
                              e.stopPropagation();
                              // Toggle the open attribute
                              detailsEl.open = !detailsEl.open;
                              return;
                            }
                          }

                          // ═══ FAQ/TOGGLE DETECTION ═══
                          // Check for .faq-item structure (common FAQ pattern)
                          const faqItem = target.closest('.faq-item');
                          if (faqItem) {
                            // IMPORTANT: Only toggle if clicking on the question part, NOT the answer
                            // This allows editing the answer text without closing the FAQ
                            const faqAnswer = target.closest('.faq-answer');
                            if (faqAnswer) {
                              // User clicked on answer area - don't toggle, allow editing
                              return;
                            }

                            // Only toggle if clicking on question or icon
                            const faqQuestion = target.closest('.faq-question');
                            const faqIcon = target.closest('.faq-icon');
                            if (faqQuestion || faqIcon) {
                              e.preventDefault();
                              e.stopPropagation();
                              // Toggle .active class on faq-item
                              const wasActive = faqItem.classList.contains('active');
                              // Close all other FAQs in same container
                              container.querySelectorAll('.faq-item.active').forEach(item => {
                                item.classList.remove('active');
                              });
                              // Toggle current
                              if (!wasActive) {
                                faqItem.classList.add('active');
                              }
                              return;
                            }
                          }

                          // Check for accordion-item structure
                          const accordionItem = target.closest('.accordion-item');
                          if (accordionItem) {
                            e.preventDefault();
                            e.stopPropagation();
                            accordionItem.classList.toggle('active');
                            return;
                          }

                          // Fallback: Find element with arrow and toggle sibling
                          const arrowRegex = /[▼▶▾▸▲▴◀◂🔽🔼⬇⬆➤►◄▽△]/;
                          let el = target;
                          for (let i = 0; i < 10 && el && el !== container; i++) {
                            if (el.tagName === 'IMG') {
                              el = el.parentElement;
                              continue;
                            }
                            const hasArrow = arrowRegex.test(el.textContent || '');
                            const nextSib = el.nextElementSibling;
                            if (hasArrow && nextSib && !arrowRegex.test(nextSib.textContent || '')) {
                              e.preventDefault();
                              e.stopPropagation();
                              // Check if hidden by display, max-height, or class
                              const style = getComputedStyle(nextSib);
                              const isHidden = style.display === 'none' ||
                                               style.maxHeight === '0px' ||
                                               nextSib.classList.contains('hidden');
                              if (isHidden) {
                                nextSib.style.display = '';
                                nextSib.style.maxHeight = '2000px';
                                nextSib.classList.remove('hidden');
                              } else {
                                nextSib.style.maxHeight = '0px';
                                nextSib.classList.add('hidden');
                              }
                              return;
                            }
                            el = el.parentElement;
                          }

                          // ═══ ELEMENT SELECTION ═══
                          if (target !== container && !target.classList.contains('selected-for-delete')) {
                            container.querySelectorAll('.selected-for-delete').forEach(el => {
                              el.classList.remove('selected-for-delete');
                            });
                            let elementToSelect = target.nodeType === 3 ? target.parentElement : target;
                            // Find meaningful parent container instead of inner elements
                            elementToSelect = findMeaningfulParent(elementToSelect, container, e);
                            if (elementToSelect && elementToSelect !== container) {
                              elementToSelect.classList.add('selected-for-delete');
                              selectedElementPathRef.current = getElementPath(elementToSelect, container);
                            }
                          }
                        }}
                        onDoubleClick={(e) => {
                          // ═══ IMAGE POSITION EDITING ═══
                          // Double-click on an image to edit position/crop
                          const target = e.target;

                          console.log('[DoubleClick] Target:', target.tagName, target.className);

                          // Find image - either the target itself or an image within/near the target
                          let clickedImg = null;

                          if (target.tagName === 'IMG') {
                            clickedImg = target;
                          } else {
                            // Check if clicked on a placeholder that contains an image
                            clickedImg = target.querySelector?.('img') || target.closest?.('.circle-placeholder, .banner-placeholder, .vertical-placeholder, .square-placeholder, .background-placeholder')?.querySelector('img');
                          }

                          console.log('[DoubleClick] Found image:', !!clickedImg);

                          if (clickedImg) {
                            e.preventDefault();
                            e.stopPropagation();

                            // Prevent default text selection behavior
                            window.getSelection?.()?.removeAllRanges?.();

                            setSelectedImageElement(clickedImg);
                            setImagePositionModalOpen(true);
                            console.log('[Image Edit] Opening position modal (normal mode):', clickedImg.src?.substring(0, 50));
                          }
                        }}
                        onContextMenu={(e) => {
                          // ═══ CONTEXT MENU FOR COPY/PASTE/DELETE ═══
                          const target = e.target;
                          const container = e.currentTarget;

                          // Find meaningful parent element
                          let elementToMenu = target.nodeType === 3 ? target.parentElement : target;
                          elementToMenu = findMeaningfulParent(elementToMenu, container, e);

                          // Only show context menu if we found a valid element
                          if (elementToMenu && elementToMenu !== container) {
                            e.preventDefault();
                            // Highlight the element
                            container.querySelectorAll('.selected-for-delete').forEach(el => {
                              el.classList.remove('selected-for-delete');
                            });
                            elementToMenu.classList.add('selected-for-delete');
                            selectedElementPathRef.current = getElementPath(elementToMenu, container);

                            setContextMenu({
                              visible: true,
                              x: e.clientX,
                              y: e.clientY,
                              element: elementToMenu
                            });
                          }
                        }}
                        onKeyDown={(e) => {
                          // Ctrl+Z for undo
                          if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                            e.preventDefault();
                            handleUndo();
                            return;
                          }
                          // Ctrl+Shift+Z or Ctrl+Y for redo
                          if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                            e.preventDefault();
                            handleRedo();
                            return;
                          }
                          // Delete selected element with Delete key ONLY (not Backspace)
                          if (e.key === 'Delete') {
                            let selectedEl = e.currentTarget.querySelector('.selected-for-delete');
                            if (!selectedEl && selectedElementPathRef.current) {
                              selectedEl = getElementByPath(selectedElementPathRef.current, e.currentTarget);
                            }
                            if (selectedEl) {
                              e.preventDefault();

                              // ═══ SAVE SCROLL POSITIONS BEFORE DELETE ═══
                              // This prevents layout shift when element is removed
                              const editor = e.currentTarget;
                              const editorScrollTop = editor.scrollTop;
                              const editorScrollLeft = editor.scrollLeft;
                              const parentScrollTop = editor.parentElement?.scrollTop || 0;
                              const windowScrollY = window.scrollY;
                              const windowScrollX = window.scrollX;

                              forceSaveToUndo();
                              selectedEl.remove();
                              selectedElementPathRef.current = null;
                              const newHtml = editor.innerHTML;
                              isInternalEditRef.current = true;
                              lastContentFromEditorRef.current = newHtml;
                              handleChange('content_html', newHtml);

                              // ═══ RESTORE SCROLL POSITIONS AFTER DELETE ═══
                              // Use requestAnimationFrame to restore after React re-render
                              requestAnimationFrame(() => {
                                editor.scrollTop = editorScrollTop;
                                editor.scrollLeft = editorScrollLeft;
                                if (editor.parentElement) {
                                  editor.parentElement.scrollTop = parentScrollTop;
                                }
                                window.scrollTo(windowScrollX, windowScrollY);
                              });

                              setSuccessMessage('Đã xóa phần tử');
                              setTimeout(() => setSuccessMessage(''), 1500);
                            }
                          }
                        }}
                        onInput={(e) => {
                          // Mark as internal edit to prevent scroll jumps
                          isInternalEditRef.current = true;
                          const newHtml = e.currentTarget.innerHTML;
                          lastContentFromEditorRef.current = newHtml;
                        }}
                        onBlur={(e) => {
                          const newHtml = e.currentTarget.innerHTML;
                          if (newHtml !== formData.content_html) {
                            isInternalEditRef.current = true;
                            lastContentFromEditorRef.current = newHtml;
                            forceSaveToUndo();
                            handleChange('content_html', newHtml);
                          }
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          // Allow copy/move operations - use 'copy' for images and toolbox items
                          const isInternalMove = e.dataTransfer.types.includes('application/x-internal-element');
                          e.dataTransfer.dropEffect = isInternalMove ? 'move' : 'copy';
                          setIsDraggingOverEditor(true);
                        }}
                        onDragEnter={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsDraggingOverEditor(true);
                          // Restore selection class if it was lost during re-render
                          if (selectedElementPathRef.current && !e.currentTarget.querySelector('.selected-for-delete')) {
                            const selectedEl = getElementByPath(selectedElementPathRef.current, e.currentTarget);
                            if (selectedEl) {
                              selectedEl.classList.add('selected-for-delete');
                              console.log('[DragEnter Normal] Restored selection:', selectedEl.tagName, selectedEl.className);
                            }
                          }
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          if (!e.currentTarget.contains(e.relatedTarget)) {
                            setIsDraggingOverEditor(false);
                          }
                        }}
                        onDrop={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsDraggingOverEditor(false);

                          const editorElement = e.currentTarget;
                          console.log('[Drop Normal] Received drop, types:', Array.from(e.dataTransfer.types));
                          console.log('[Drop Normal] selectedElementPathRef:', selectedElementPathRef.current);
                          console.log('[Drop Normal] Selected elements in DOM:', editorElement.querySelectorAll('.selected-for-delete').length);
                          let imageUrl = '';
                          let altText = '';

                          // ═══ 0. Check for Internal Element Move ═══
                          const isInternalMove = e.dataTransfer.getData('application/x-internal-element');
                          if (isInternalMove && draggingInternalElementRef.current) {
                            const draggedElement = draggingInternalElementRef.current;
                            const { target, position } = findDropTarget(e, editorElement);

                            // Don't drop on itself
                            if (target === draggedElement || target?.contains(draggedElement)) {
                              draggingInternalElementRef.current = null;
                              return;
                            }

                            forceSaveToUndo();

                            // Remove from original position
                            draggedElement.remove();

                            // Insert at new position
                            if (target && position !== 'inside') {
                              if (position === 'before') {
                                target.parentNode.insertBefore(draggedElement, target);
                              } else {
                                target.parentNode.insertBefore(draggedElement, target.nextSibling);
                              }
                            } else {
                              editorElement.appendChild(draggedElement);
                            }

                            // Restore opacity
                            draggedElement.style.opacity = '1';

                            // Sync to formData
                            const newHtml = editorElement.innerHTML;
                            isInternalEditRef.current = true;
                            lastContentFromEditorRef.current = newHtml;
                            handleChange('content_html', newHtml);
                            setSuccessMessage('Đã di chuyển phần tử');
                            setTimeout(() => setSuccessMessage(''), 1500);

                            draggingInternalElementRef.current = null;
                            return;
                          }

                          // Check for toolbox component
                          const toolboxData = e.dataTransfer.getData('application/x-toolbox-item');
                          if (toolboxData) {
                            try {
                              const item = JSON.parse(toolboxData);
                              if (item.html) {
                                const { target, position } = findDropTarget(e, editorElement);

                                // Auto-adapt component background to match parent section
                                const adaptedHtml = adaptComponentToBackground(item.html, target || editorElement);

                                forceSaveToUndo();

                                if (target && position !== 'inside') {
                                  const temp = document.createElement('div');
                                  temp.innerHTML = adaptedHtml;
                                  const newElement = temp.firstElementChild || temp.firstChild;
                                  if (newElement) {
                                    if (position === 'before') {
                                      target.parentNode.insertBefore(newElement, target);
                                    } else {
                                      target.parentNode.insertBefore(newElement, target.nextSibling);
                                    }
                                  }
                                } else {
                                  const range = document.caretRangeFromPoint(e.clientX, e.clientY);
                                  if (range) {
                                    const selection = window.getSelection();
                                    selection.removeAllRanges();
                                    selection.addRange(range);
                                    document.execCommand('insertHTML', false, adaptedHtml);
                                  } else {
                                    editorElement.insertAdjacentHTML('beforeend', adaptedHtml);
                                  }
                                }

                                // Sync to formData (mark as internal edit to prevent scroll jump)
                                const newHtml = editorElement.innerHTML;
                                isInternalEditRef.current = true;
                                lastContentFromEditorRef.current = newHtml;
                                handleChange('content_html', newHtml);
                                setSuccessMessage(`Đã thêm: ${item.label}`);
                                setTimeout(() => setSuccessMessage(''), 1500);
                                return;
                              }
                            } catch (err) {
                              console.error('Error parsing toolbox item:', err);
                            }
                          }

                          const imageData = e.dataTransfer.getData('application/json');
                          console.log('[Drop Normal] imageData:', imageData ? imageData.substring(0, 100) : 'null');
                          if (imageData) {
                            try {
                              const img = JSON.parse(imageData);
                              imageUrl = img.image_url;
                              altText = img.alt_text || img.position_id;
                              console.log('[Drop Normal] Parsed image URL:', imageUrl?.substring(0, 50));
                            } catch (err) {
                              console.error('Error parsing image data:', err);
                            }
                          }

                          if (!imageUrl) {
                            const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
                            if (files.length > 0 && lessonId && lessonId !== 'new') {
                              const file = files[0];
                              try {
                                const positionId = courseImageService.generatePositionId(file.name);
                                const { data, error } = await courseImageService.uploadAndCreate(file, lessonId, { positionId });
                                if (error) throw error;
                                if (data) {
                                  setLessonImages(prev => [...prev, data]);
                                  imageUrl = data.image_url;
                                  altText = data.alt_text || data.position_id;
                                }
                              } catch (err) {
                                setError(`Lỗi upload: ${err.message}`);
                                return;
                              }
                            }
                          }

                          if (imageUrl) {
                            const imgHtml = `<img src="${imageUrl}" alt="${altText}" style="width: 100%; max-width: 800px; height: auto; display: block; margin-top: 16px; margin-left: auto; margin-right: auto; margin-bottom: 40px; padding: 0; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.2);" />`;
                            forceSaveToUndo();

                            // ═══ SMART DROP: Detect and replace placeholder/selected element ═══
                            let inserted = false;

                            // Find element under cursor
                            const elementUnderCursor = document.elementFromPoint(e.clientX, e.clientY);

                            // Create new image element
                            const createNewImg = () => {
                              const newImg = document.createElement('img');
                              newImg.src = imageUrl;
                              newImg.alt = altText;
                              newImg.style.cssText = 'width: 100%; max-width: 800px; height: auto; display: block; margin: 0 auto; padding: 0; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.2);';
                              return newImg;
                            };

                            // ═══ PRIORITY 1: Check for selected element first ═══
                            // Try to find by class first, then by stored path (in case class was lost on re-render)
                            let selectedEl = editorElement.querySelector('.selected-for-delete');
                            console.log('[Drop Normal] selectedEl by class:', selectedEl?.tagName, selectedEl?.className);
                            if (!selectedEl && selectedElementPathRef.current) {
                              selectedEl = getElementByPath(selectedElementPathRef.current, editorElement);
                              console.log('[Drop Normal] selectedEl by path:', selectedEl?.tagName, selectedEl?.className);
                            }
                            console.log('[Drop Normal] Final selectedEl:', selectedEl ? `${selectedEl.tagName}.${selectedEl.className}` : 'null');
                            if (selectedEl) {
                              const newImg = createNewImg();

                              if (selectedEl.tagName === 'IMG') {
                                const parent = selectedEl.parentElement;
                                if (parent && parent.classList?.contains('lesson-image')) {
                                  parent.innerHTML = '';
                                  parent.appendChild(newImg);
                                } else {
                                  selectedEl.parentNode.replaceChild(newImg, selectedEl);
                                }
                                inserted = true;
                                setSuccessMessage('✅ Đã thay thế hình ảnh đang chọn');
                              } else if (
                                selectedEl.classList?.contains('lesson-image') ||
                                selectedEl.classList?.contains('image-placeholder') ||
                                selectedEl.classList?.contains('circle-placeholder') ||
                                selectedEl.classList?.contains('banner-placeholder') ||
                                selectedEl.classList?.contains('vertical-placeholder') ||
                                selectedEl.classList?.contains('square-placeholder') ||
                                selectedEl.classList?.contains('background-placeholder') ||
                                (selectedEl.className && typeof selectedEl.className === 'string' && selectedEl.className.includes('placeholder'))
                              ) {
                                // For circle placeholder - REPLACE with circular image in wrapper
                                if (selectedEl.classList?.contains('circle-placeholder')) {
                                  const size = selectedEl.style.width || '150px';
                                  const container = document.createElement('div');
                                  container.style.cssText = `display: block; width: 100%; text-align: center;`;
                                  const wrapper = document.createElement('div');
                                  wrapper.style.cssText = `width: ${size}; height: ${size}; border-radius: 50%; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.2); display: inline-block; margin: 16px auto 40px auto;`;
                                  wrapper.className = 'circle-image-wrapper';
                                  newImg.style.cssText = `width: 100%; height: 100%; object-fit: cover; display: block;`;
                                  wrapper.appendChild(newImg);
                                  container.appendChild(wrapper);
                                  const spacerDiv = document.createElement('div');
                                  spacerDiv.style.cssText = `display: block; width: 100%; height: 40px; min-height: 40px; line-height: 40px; font-size: 1px; clear: both;`;
                                  spacerDiv.innerHTML = '&nbsp;';
                                  container.appendChild(spacerDiv);
                                  selectedEl.parentNode.replaceChild(container, selectedEl);
                                  inserted = true;
                                  setSuccessMessage('✅ Đã thay thế avatar tròn');
                                }
                                // For banner placeholder - REPLACE with 16:9 image in wrapper
                                else if (selectedEl.classList?.contains('banner-placeholder')) {
                                  const maxW = selectedEl.style.maxWidth || '800px';
                                  const container = document.createElement('div');
                                  container.style.cssText = `display: block; width: 100%;`;
                                  const wrapper = document.createElement('div');
                                  wrapper.style.cssText = `width: 100%; max-width: ${maxW}; aspect-ratio: 16/9; overflow: hidden; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.2); display: block; margin: 16px auto 40px auto;`;
                                  wrapper.className = 'banner-image-wrapper';
                                  newImg.style.cssText = `width: 100%; height: 100%; object-fit: cover; display: block;`;
                                  wrapper.appendChild(newImg);
                                  container.appendChild(wrapper);
                                  const spacerDiv = document.createElement('div');
                                  spacerDiv.style.cssText = `display: block; width: 100%; height: 40px; min-height: 40px; line-height: 40px; font-size: 1px; clear: both;`;
                                  spacerDiv.innerHTML = '&nbsp;';
                                  container.appendChild(spacerDiv);
                                  selectedEl.parentNode.replaceChild(container, selectedEl);
                                  inserted = true;
                                  setSuccessMessage('✅ Đã thay thế banner 16:9');
                                }
                                // For vertical placeholder - REPLACE with 9:16 image in wrapper
                                else if (selectedEl.classList?.contains('vertical-placeholder')) {
                                  const maxW = selectedEl.style.maxWidth || '450px';
                                  const container = document.createElement('div');
                                  container.style.cssText = `display: block; width: 100%;`;
                                  const wrapper = document.createElement('div');
                                  wrapper.style.cssText = `width: 100%; max-width: ${maxW}; aspect-ratio: 9/16; overflow: hidden; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.2); display: block; margin: 16px auto 40px auto;`;
                                  wrapper.className = 'vertical-image-wrapper';
                                  newImg.style.cssText = `width: 100%; height: 100%; object-fit: cover; display: block;`;
                                  wrapper.appendChild(newImg);
                                  container.appendChild(wrapper);
                                  const spacerDiv = document.createElement('div');
                                  spacerDiv.style.cssText = `display: block; width: 100%; height: 40px; min-height: 40px; line-height: 40px; font-size: 1px; clear: both;`;
                                  spacerDiv.innerHTML = '&nbsp;';
                                  container.appendChild(spacerDiv);
                                  selectedEl.parentNode.replaceChild(container, selectedEl);
                                  inserted = true;
                                  setSuccessMessage('✅ Đã thay thế hình dọc 9:16');
                                }
                                // For square placeholder - REPLACE with 1:1 image in wrapper
                                else if (selectedEl.classList?.contains('square-placeholder')) {
                                  const maxW = selectedEl.style.maxWidth || '500px';
                                  const container = document.createElement('div');
                                  container.style.cssText = `display: block; width: 100%;`;
                                  const wrapper = document.createElement('div');
                                  wrapper.style.cssText = `width: 100%; max-width: ${maxW}; aspect-ratio: 1/1; overflow: hidden; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.2); display: block; margin: 16px auto 40px auto;`;
                                  wrapper.className = 'square-image-wrapper';
                                  newImg.style.cssText = `width: 100%; height: 100%; object-fit: cover; display: block;`;
                                  wrapper.appendChild(newImg);
                                  container.appendChild(wrapper);
                                  const spacerDiv = document.createElement('div');
                                  spacerDiv.style.cssText = `display: block; width: 100%; height: 40px; min-height: 40px; line-height: 40px; font-size: 1px; clear: both;`;
                                  spacerDiv.innerHTML = '&nbsp;';
                                  container.appendChild(spacerDiv);
                                  selectedEl.parentNode.replaceChild(container, selectedEl);
                                  inserted = true;
                                  setSuccessMessage('✅ Đã thay thế hình vuông 1:1');
                                }
                                // For background placeholder - REPLACE with background section
                                else if (selectedEl.classList?.contains('background-placeholder')) {
                                  const minH = selectedEl.style.minHeight || '400px';
                                  const section = document.createElement('section');
                                  section.className = 'background-section';
                                  section.style.cssText = `position: relative; width: 100%; min-height: ${minH}; background-image: url('${imageUrl}'); background-size: cover; background-position: center; background-repeat: no-repeat; border-radius: 16px; overflow: hidden; margin: 16px 0 40px 0;`;
                                  const overlay = document.createElement('div');
                                  overlay.className = 'background-overlay';
                                  overlay.style.cssText = `position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 100%); z-index: 1;`;
                                  section.appendChild(overlay);
                                  const content = document.createElement('div');
                                  content.className = 'background-content';
                                  content.style.cssText = `position: relative; z-index: 2; padding: 60px 40px; text-align: center;`;
                                  content.innerHTML = '<h2 style="color: #fff; font-size: 2rem; font-weight: 700; margin-bottom: 16px; text-shadow: 0 2px 8px rgba(0,0,0,0.5);">Tiêu đề Section</h2><p style="color: rgba(255,255,255,0.9); font-size: 1.1rem; max-width: 600px; margin: 0 auto;">Mô tả nội dung của section này. Chỉnh sửa text này theo ý muốn.</p>';
                                  section.appendChild(content);
                                  const container = document.createElement('div');
                                  container.appendChild(section);
                                  const spacerDiv = document.createElement('div');
                                  spacerDiv.style.cssText = `display: block; width: 100%; height: 40px; min-height: 40px; line-height: 40px; font-size: 1px; clear: both;`;
                                  spacerDiv.innerHTML = '&nbsp;';
                                  container.appendChild(spacerDiv);
                                  selectedEl.parentNode.replaceChild(container, selectedEl);
                                  inserted = true;
                                  setSuccessMessage('✅ Đã thay thế background section');
                                }
                                // For other placeholders
                                else {
                                  selectedEl.parentNode.replaceChild(newImg, selectedEl);
                                  inserted = true;
                                  setSuccessMessage('✅ Đã thay thế placeholder đang chọn');
                                }
                              } else {
                                selectedEl.parentNode.replaceChild(newImg, selectedEl);
                                inserted = true;
                                setSuccessMessage('✅ Đã thay thế element đang chọn');
                              }
                            }

                            // ═══ PRIORITY 2: Check element under cursor ═══
                            if (!inserted && elementUnderCursor && elementUnderCursor !== editorElement) {
                              if (elementUnderCursor.tagName === 'IMG') {
                                const newImg = createNewImg();
                                const parent = elementUnderCursor.parentElement;
                                if (parent && parent.classList?.contains('lesson-image')) {
                                  parent.innerHTML = '';
                                  parent.appendChild(newImg);
                                } else {
                                  elementUnderCursor.parentNode.replaceChild(newImg, elementUnderCursor);
                                }
                                inserted = true;
                                setSuccessMessage('✅ Đã thay thế hình ảnh');
                              } else {
                                let current = elementUnderCursor;
                                let maxDepth = 10;
                                while (current && maxDepth > 0 && current !== editorElement) {
                                  // Check for any placeholder class
                                  const isPlaceholder =
                                    current.classList?.contains('lesson-image') ||
                                    current.classList?.contains('image-placeholder') ||
                                    current.classList?.contains('circle-placeholder') ||
                                    current.classList?.contains('banner-placeholder') ||
                                    current.classList?.contains('vertical-placeholder') ||
                                    current.classList?.contains('square-placeholder') ||
                                    current.classList?.contains('background-placeholder') ||
                                    (current.className && typeof current.className === 'string' && current.className.includes('placeholder'));

                                  if (isPlaceholder) {
                                    const newImg = createNewImg();

                                    // For circle placeholder - REPLACE with circular image in wrapper
                                    if (current.classList?.contains('circle-placeholder')) {
                                      const size = current.style.width || '150px';
                                      const container = document.createElement('div');
                                      container.style.cssText = `display: block; width: 100%; text-align: center;`;
                                      const wrapper = document.createElement('div');
                                      wrapper.style.cssText = `width: ${size}; height: ${size}; border-radius: 50%; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.2); display: inline-block; margin: 16px auto 40px auto;`;
                                      wrapper.className = 'circle-image-wrapper';
                                      newImg.style.cssText = `width: 100%; height: 100%; object-fit: cover; display: block;`;
                                      wrapper.appendChild(newImg);
                                      container.appendChild(wrapper);
                                      const spacerDiv = document.createElement('div');
                                      spacerDiv.style.cssText = `display: block; width: 100%; height: 40px; min-height: 40px; line-height: 40px; font-size: 1px; clear: both;`;
                                      spacerDiv.innerHTML = '&nbsp;';
                                      container.appendChild(spacerDiv);
                                      current.parentNode.replaceChild(container, current);
                                      inserted = true;
                                      setSuccessMessage('✅ Đã thay thế avatar tròn');
                                      break;
                                    }
                                    // For banner placeholder - REPLACE with 16:9 image in wrapper
                                    else if (current.classList?.contains('banner-placeholder')) {
                                      const maxW = current.style.maxWidth || '800px';
                                      const container = document.createElement('div');
                                      container.style.cssText = `display: block; width: 100%;`;
                                      const wrapper = document.createElement('div');
                                      wrapper.style.cssText = `width: 100%; max-width: ${maxW}; aspect-ratio: 16/9; overflow: hidden; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.2); display: block; margin: 16px auto 40px auto;`;
                                      wrapper.className = 'banner-image-wrapper';
                                      newImg.style.cssText = `width: 100%; height: 100%; object-fit: cover; display: block;`;
                                      wrapper.appendChild(newImg);
                                      container.appendChild(wrapper);
                                      const spacerDiv = document.createElement('div');
                                      spacerDiv.style.cssText = `display: block; width: 100%; height: 40px; min-height: 40px; line-height: 40px; font-size: 1px; clear: both;`;
                                      spacerDiv.innerHTML = '&nbsp;';
                                      container.appendChild(spacerDiv);
                                      current.parentNode.replaceChild(container, current);
                                      inserted = true;
                                      setSuccessMessage('✅ Đã thay thế banner 16:9');
                                      break;
                                    }
                                    // For vertical placeholder - REPLACE with 9:16 image in wrapper
                                    else if (current.classList?.contains('vertical-placeholder')) {
                                      const maxW = current.style.maxWidth || '450px';
                                      const container = document.createElement('div');
                                      container.style.cssText = `display: block; width: 100%;`;
                                      const wrapper = document.createElement('div');
                                      wrapper.style.cssText = `width: 100%; max-width: ${maxW}; aspect-ratio: 9/16; overflow: hidden; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.2); display: block; margin: 16px auto 40px auto;`;
                                      wrapper.className = 'vertical-image-wrapper';
                                      newImg.style.cssText = `width: 100%; height: 100%; object-fit: cover; display: block;`;
                                      wrapper.appendChild(newImg);
                                      container.appendChild(wrapper);
                                      const spacerDiv = document.createElement('div');
                                      spacerDiv.style.cssText = `display: block; width: 100%; height: 40px; min-height: 40px; line-height: 40px; font-size: 1px; clear: both;`;
                                      spacerDiv.innerHTML = '&nbsp;';
                                      container.appendChild(spacerDiv);
                                      current.parentNode.replaceChild(container, current);
                                      inserted = true;
                                      setSuccessMessage('✅ Đã thay thế hình dọc 9:16');
                                      break;
                                    }
                                    // For square placeholder - REPLACE with 1:1 image in wrapper
                                    else if (current.classList?.contains('square-placeholder')) {
                                      const maxW = current.style.maxWidth || '500px';
                                      const container = document.createElement('div');
                                      container.style.cssText = `display: block; width: 100%;`;
                                      const wrapper = document.createElement('div');
                                      wrapper.style.cssText = `width: 100%; max-width: ${maxW}; aspect-ratio: 1/1; overflow: hidden; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.2); display: block; margin: 16px auto 40px auto;`;
                                      wrapper.className = 'square-image-wrapper';
                                      newImg.style.cssText = `width: 100%; height: 100%; object-fit: cover; display: block;`;
                                      wrapper.appendChild(newImg);
                                      container.appendChild(wrapper);
                                      const spacerDiv = document.createElement('div');
                                      spacerDiv.style.cssText = `display: block; width: 100%; height: 40px; min-height: 40px; line-height: 40px; font-size: 1px; clear: both;`;
                                      spacerDiv.innerHTML = '&nbsp;';
                                      container.appendChild(spacerDiv);
                                      current.parentNode.replaceChild(container, current);
                                      inserted = true;
                                      setSuccessMessage('✅ Đã thay thế hình vuông 1:1');
                                      break;
                                    }
                                    // For background placeholder - REPLACE with background section
                                    else if (current.classList?.contains('background-placeholder')) {
                                      const minH = current.style.minHeight || '400px';
                                      const section = document.createElement('section');
                                      section.className = 'background-section';
                                      section.style.cssText = `position: relative; width: 100%; min-height: ${minH}; background-image: url('${imageUrl}'); background-size: cover; background-position: center; background-repeat: no-repeat; border-radius: 16px; overflow: hidden; margin: 16px 0 40px 0;`;
                                      const overlay = document.createElement('div');
                                      overlay.className = 'background-overlay';
                                      overlay.style.cssText = `position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 100%); z-index: 1;`;
                                      section.appendChild(overlay);
                                      const content = document.createElement('div');
                                      content.className = 'background-content';
                                      content.style.cssText = `position: relative; z-index: 2; padding: 60px 40px; text-align: center;`;
                                      content.innerHTML = '<h2 style="color: #fff; font-size: 2rem; font-weight: 700; margin-bottom: 16px; text-shadow: 0 2px 8px rgba(0,0,0,0.5);">Tiêu đề Section</h2><p style="color: rgba(255,255,255,0.9); font-size: 1.1rem; max-width: 600px; margin: 0 auto;">Mô tả nội dung của section này. Chỉnh sửa text này theo ý muốn.</p>';
                                      section.appendChild(content);
                                      const container = document.createElement('div');
                                      container.appendChild(section);
                                      const spacerDiv = document.createElement('div');
                                      spacerDiv.style.cssText = `display: block; width: 100%; height: 40px; min-height: 40px; line-height: 40px; font-size: 1px; clear: both;`;
                                      spacerDiv.innerHTML = '&nbsp;';
                                      container.appendChild(spacerDiv);
                                      current.parentNode.replaceChild(container, current);
                                      inserted = true;
                                      setSuccessMessage('✅ Đã thay thế background section');
                                      break;
                                    }
                                    // For other placeholders (lesson-image, image-placeholder)
                                    else {
                                      current.innerHTML = '';
                                      current.appendChild(newImg);
                                      inserted = true;
                                      setSuccessMessage('✅ Đã thay thế placeholder');
                                      break;
                                    }
                                  }
                                  // Check for dashed border placeholder by text content
                                  const text = current.textContent || '';
                                  if (text.includes('Kéo thả hình') || text.includes('🖼️') || text.includes('👤') || text.includes('Banner')) {
                                    const newImg = createNewImg();

                                    // Circle placeholder detected by 👤 emoji
                                    if (text.includes('👤') || current.style.borderRadius === '50%') {
                                      const size = current.style.width || '150px';
                                      const wrapper = document.createElement('div');
                                      wrapper.style.cssText = `width: ${size}; height: ${size}; border-radius: 50%; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.2); display: block; margin: 0 auto;`;
                                          // Wrap in spacing container for Shopify compatibility
                                          const spacer = document.createElement('div');
                                          spacer.style.cssText = `padding: 16px 0 40px 0; display: block; width: 100%;`;
                                          spacer.appendChild(wrapper);
                                          current.parentNode.replaceChild(spacer, current);
                                      wrapper.className = 'circle-image-wrapper';
                                      newImg.style.cssText = `width: 100%; height: 100%; object-fit: cover; display: block;`;
                                      wrapper.appendChild(newImg);
                                      current.parentNode.replaceChild(wrapper, current);
                                      inserted = true;
                                      setSuccessMessage('✅ Đã thay thế avatar tròn');
                                      break;
                                    }
                                    // Banner placeholder detected by Banner text or 16:9 aspect
                                    else if (text.includes('Banner') || text.includes('16:9') || current.style.aspectRatio === '16/9' || current.style.aspectRatio === '16 / 9') {
                                      const maxW = current.style.maxWidth || '800px';
                                      const wrapper = document.createElement('div');
                                      wrapper.style.cssText = `width: 100%; max-width: ${maxW}; aspect-ratio: 16/9; overflow: hidden; margin-top: 16px; margin-left: auto; margin-right: auto; margin-bottom: 40px; padding-bottom: 0; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.2); display: block;`;
                                      wrapper.className = 'banner-image-wrapper';
                                      newImg.style.cssText = `width: 100%; height: 100%; object-fit: cover; display: block;`;
                                      wrapper.appendChild(newImg);
                                      current.parentNode.replaceChild(wrapper, current);
                                      inserted = true;
                                      setSuccessMessage('✅ Đã thay thế banner 16:9');
                                      break;
                                    }
                                    // Other placeholders
                                    else {
                                      if (current.parentElement?.classList?.contains('lesson-image')) {
                                        current.parentElement.innerHTML = '';
                                        current.parentElement.appendChild(newImg);
                                      } else {
                                        current.parentNode.replaceChild(newImg, current);
                                      }
                                      inserted = true;
                                      setSuccessMessage('✅ Đã thay thế placeholder');
                                      break;
                                    }
                                  }
                                  current = current.parentElement;
                                  maxDepth--;
                                }
                              }
                            }

                            // Fallback: Try caretRangeFromPoint
                            if (!inserted) {
                              const range = document.caretRangeFromPoint(e.clientX, e.clientY);
                              if (range && editorElement.contains(range.startContainer)) {
                                const selection = window.getSelection();
                                selection.removeAllRanges();
                                selection.addRange(range);
                                document.execCommand('insertHTML', false, imgHtml);
                                inserted = true;
                                setSuccessMessage('Đã chèn hình tại vị trí thả');
                              }
                            }

                            // Last fallback: append to editor
                            if (!inserted) {
                              editorElement.insertAdjacentHTML('beforeend', imgHtml);
                              setSuccessMessage('Đã chèn hình ảnh');
                            }

                            // Clear any selection
                            const selectedElFinal = editorElement.querySelector('.selected-for-delete');
                            if (selectedElFinal) selectedElFinal.classList.remove('selected-for-delete');
                            selectedElementPathRef.current = null;

                            // Sync to formData
                            const newHtml = editorElement.innerHTML;
                            isInternalEditRef.current = true;
                            lastContentFromEditorRef.current = newHtml;
                            handleChange('content_html', newHtml);
                            setTimeout(() => setSuccessMessage(''), 1500);
                          }
                        }}
                      />
                    )
                  ) : (
                    <textarea
                      ref={textareaRef}
                      className={`form-textarea code-editor ${isDraggingOverEditor ? 'drag-over' : ''}`}
                      placeholder="<h2>Tiêu đề</h2>&#10;<p>Nội dung bài học...</p>&#10;&#10;Kéo thả hình ảnh vào đây để chèn..."
                      value={formData.content_html}
                      onChange={(e) => handleChange('content_html', e.target.value)}
                      onKeyDown={(e) => {
                        // Ctrl+Z for undo
                        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                          e.preventDefault();
                          handleUndo();
                          return;
                        }
                        // Ctrl+Shift+Z or Ctrl+Y for redo
                        if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                          e.preventDefault();
                          handleRedo();
                          return;
                        }
                      }}
                      onPaste={handlePaste}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingOverEditor(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        setIsDraggingOverEditor(false);
                      }}
                      onDrop={handleEditorDrop}
                      rows={18}
                      spellCheck={false}
                    />
                  )}
                  {errors.content_html && <span className="form-error">{errors.content_html}</span>}

                  <div className="html-editor-footer">
                    <span className="char-count">{formData.content_html.length} ký tự</span>
                    <span className="editor-hint">Ctrl+Z: Hoàn tác | Ctrl+V: Dán</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quiz Type Notice */}
            {formData.lesson_type === 'quiz' && (
              <div className="quiz-notice">
                <HelpCircle size={24} />
                <div className="quiz-notice-content">
                  <h4>Bài kiểm tra</h4>
                  <p>Sau khi lưu bài học, bạn có thể thêm câu hỏi cho bài kiểm tra.</p>
                  <button
                    type="button"
                    className="btn-goto-quiz"
                    onClick={() => {
                      if (isEditing) {
                        navigate(`/courses/admin/edit/${courseId}/modules/${moduleId}/lessons/${lessonId}/quiz`);
                      } else {
                        alert('Vui lòng lưu bài học trước khi thêm câu hỏi');
                      }
                    }}
                    disabled={!isEditing}
                  >
                    {isEditing ? 'Quản lý câu hỏi' : 'Lưu để thêm câu hỏi'}
                  </button>
                </div>
              </div>
            )}
            </div>
            {/* End Content Editor Column */}
          </div>
          {/* End content-columns */}
        </div>
        {/* End content-tab-layout */}
          </div>
        </div>

        {/* Right Sidebar - Images Panel */}
        <aside
          className={`images-sidebar ${isDraggingFile ? 'panel-dragging' : ''}`}
          onDragEnter={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDraggingFile(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = 'copy';
            setIsDraggingFile(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const rect = e.currentTarget.getBoundingClientRect();
            const isOutside = e.clientX < rect.left || e.clientX > rect.right ||
                             e.clientY < rect.top || e.clientY > rect.bottom;
            if (isOutside) {
              setIsDraggingFile(false);
            }
          }}
          onDrop={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDraggingFile(false);
            console.log('[Sidebar Aside Drop] Drop event received');

            if (!lessonId || lessonId === 'new') {
              setError('Lưu bài học trước khi upload hình');
              return;
            }

            const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
            console.log('[Sidebar Aside Drop] Files found:', files.length, files);

            if (files.length === 0) {
              const imageUrl = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
              console.log('[Sidebar Aside Drop] No files, URL:', imageUrl);
              if (imageUrl && /\.(png|jpg|jpeg|gif|webp)/i.test(imageUrl)) {
                setError('Kéo file từ máy tính, không phải từ trình duyệt');
              } else {
                setError('Không tìm thấy file hình ảnh');
              }
              return;
            }

            setSuccessMessage(`Đang upload ${files.length} hình...`);

            for (const file of files) {
              try {
                const positionId = courseImageService.generatePositionId(file.name);
                const { data, error } = await courseImageService.uploadAndCreate(file, lessonId, { positionId });
                if (error) throw error;
                if (data) {
                  setLessonImages(prev => [...prev, data]);
                  setSuccessMessage(`Đã upload: ${file.name}`);
                  setTimeout(() => setSuccessMessage(''), 2000);
                }
              } catch (err) {
                console.error('Upload error:', err);
                setError(`Lỗi upload: ${err.message}`);
              }
            }
          }}
        >
          <div
            className={`sidebar-images-panel-inner ${isDraggingFile ? 'panel-dragging' : ''}`}
            onDragEnter={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDraggingFile(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.dataTransfer.dropEffect = 'copy';
              setIsDraggingFile(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Only set false if leaving the panel entirely
              const rect = e.currentTarget.getBoundingClientRect();
              const isOutside = e.clientX < rect.left || e.clientX > rect.right ||
                               e.clientY < rect.top || e.clientY > rect.bottom;
              if (isOutside) {
                setIsDraggingFile(false);
              }
            }}
            onDrop={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDraggingFile(false);
              console.log('[Sidebar Inner Drop] ★★★ DROP EVENT ON INNER ★★★');

              if (!lessonId || lessonId === 'new') {
                setError('Lưu bài học trước khi upload hình');
                console.log('[Sidebar Drop] No lessonId');
                return;
              }

              const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
              console.log('[Sidebar Inner Drop] Image files found:', files.length);

              if (files.length === 0) {
                // Check if it's an image from browser (URL)
                const imageUrl = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
                console.log('[Sidebar Inner Drop] No files, checking URL:', imageUrl);
                if (imageUrl && (imageUrl.includes('.png') || imageUrl.includes('.jpg') || imageUrl.includes('.jpeg') || imageUrl.includes('.gif') || imageUrl.includes('.webp'))) {
                  setError('Kéo file từ máy tính, không phải từ trình duyệt');
                } else {
                  setError('Không tìm thấy file hình ảnh');
                }
                return;
              }

              setSuccessMessage(`Đang upload ${files.length} hình...`);

              for (const file of files) {
                try {
                  console.log('[Sidebar Inner Drop] Uploading:', file.name);
                  const positionId = courseImageService.generatePositionId(file.name);
                  const { data, error } = await courseImageService.uploadAndCreate(file, lessonId, { positionId });
                  if (error) throw error;
                  if (data) {
                    setLessonImages(prev => [...prev, data]);
                    setSuccessMessage(`Đã upload: ${file.name}`);
                    setTimeout(() => setSuccessMessage(''), 2000);
                  }
                } catch (err) {
                  console.error('Upload error:', err);
                  setError(`Lỗi upload: ${err.message}`);
                }
              }
            }}
          >
            <div className="images-panel-header">
              <h4>
                <Image size={16} />
                Hình ảnh
                {lessonImages.length > 0 && <span className="badge">{lessonImages.length}</span>}
              </h4>
              <div className="images-panel-actions">
                <select
                  className="sort-select"
                  value={imageSortOrder}
                  onChange={(e) => setImageSortOrder(e.target.value)}
                  title="Sắp xếp"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                  <option value="name">Tên A-Z</option>
                </select>
                {lessonId && lessonId !== 'new' && (
                  <button
                    type="button"
                    onClick={fetchLessonImages}
                    className="btn-refresh-images"
                    title="Tải lại"
                  >
                    {imagesLoading ? <Loader2 size={12} className="animate-spin" /> : 'Tải lại'}
                  </button>
                )}
              </div>
            </div>

            {/* Drop overlay */}
            {isDraggingFile && (
              <div className="drop-overlay">
                <Upload size={24} />
                <span>Thả để upload</span>
              </div>
            )}

            {/* Images List */}
            <div className="sidebar-images-list">
              {!lessonId || lessonId === 'new' ? (
                <div className="images-panel-empty">
                  <AlertCircle size={20} style={{ opacity: 0.5, marginBottom: '8px' }} />
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>Lưu bài học trước</span>
                </div>
              ) : imagesLoading ? (
                <div className="images-panel-empty">
                  <Loader2 size={20} className="animate-spin" />
                </div>
              ) : sortedImages.length === 0 ? (
                <div className="images-panel-empty">
                  <Upload size={24} style={{ opacity: 0.5, marginBottom: '8px' }} />
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>Kéo thả hình vào đây</span>
                </div>
              ) : (
                sortedImages.map((img) => {
                  const htmlTag = `<img src="${img.image_url}" alt="${img.alt_text || img.position_id}" />`;
                  const isCopied = copiedImageId === img.id;
                  return (
                    <div
                      key={img.id}
                      className="sidebar-image-item draggable-image"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('application/json', JSON.stringify(img));
                        e.dataTransfer.effectAllowed = 'copy';
                      }}
                      title="Kéo thả vào editor để chèn"
                    >
                      <div
                        className="sidebar-image-thumb"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLightboxImage(img);
                        }}
                        style={{ cursor: 'zoom-in' }}
                      >
                        <img src={img.image_url} alt={img.position_id} draggable={false} />
                      </div>
                      <div className="sidebar-image-info">
                        <div className="sidebar-image-id">{img.position_id}</div>
                        <div className="sidebar-image-actions">
                          <button
                            type="button"
                            className={`btn-copy-img-small ${isCopied ? 'copied' : ''}`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              navigator.clipboard.writeText(htmlTag).then(() => {
                                setCopiedImageId(img.id);
                                setTimeout(() => setCopiedImageId(null), 1500);
                              });
                            }}
                          >
                            {isCopied ? <Check size={10} /> : <Copy size={10} />}
                            {isCopied ? 'OK!' : 'Copy'}
                          </button>
                          <button
                            type="button"
                            className="btn-download-img-small"
                            onClick={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              try {
                                const response = await fetch(img.image_url);
                                const blob = await response.blob();
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = img.position_id || 'image';
                                document.body.appendChild(a);
                                a.click();
                                window.URL.revokeObjectURL(url);
                                document.body.removeChild(a);
                              } catch (err) {
                                console.error('Download failed:', err);
                                setError('Không thể tải về');
                              }
                            }}
                            title="Tải về"
                          >
                            <Download size={10} />
                          </button>
                          <button
                            type="button"
                            className="btn-delete-img-small"
                            onClick={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              try {
                                const { error } = await courseImageService.delete(img.id);
                                if (error) throw error;
                                setLessonImages(prev => prev.filter(i => i.id !== img.id));
                                setSuccessMessage('Đã xóa hình ảnh');
                                setTimeout(() => setSuccessMessage(''), 2000);
                              } catch (err) {
                                setError(`Lỗi xóa: ${err.message}`);
                              }
                            }}
                            title="Xóa hình ảnh"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </aside>
        </div>
      </div>

      {/* Media Library Modal */}
      <MediaLibraryModal
        isOpen={mediaLibraryVisible}
        onClose={() => setMediaLibraryVisible(false)}
        onSelect={handleSelectFromLibrary}
      />

      {/* Image Edit Modal */}
      <ImageEditModal
        isOpen={!!editingImage}
        image={editingImage}
        onClose={() => setEditingImage(null)}
        onSave={handleUpdateImage}
      />

      {/* Product Picker Modal */}
      <ProductPickerModal
        isOpen={showProductPicker}
        onClose={() => setShowProductPicker(false)}
        onSelect={({ products, style, html }) => {
          // Insert the product HTML into the content
          const currentHtml = formData.content_html || '';
          const newHtml = currentHtml + '\n' + html;
          handleChange('content_html', newHtml);
          setShowProductPicker(false);
        }}
        lessonId={lessonId || createdLessonId}
      />

      {/* Image Position/Crop Modal - Double-click on images to edit */}
      <ImagePositionModal
        isOpen={imagePositionModalOpen}
        imageElement={selectedImageElement}
        onClose={() => {
          setImagePositionModalOpen(false);
          setSelectedImageElement(null);
        }}
        onSave={(settings) => {
          // Debug: Check what we have
          console.log('[ImagePosition] onSave called with settings:', settings);
          console.log('[ImagePosition] selectedImageElement exists:', !!selectedImageElement);
          console.log('[ImagePosition] selectedImageElement tagName:', selectedImageElement?.tagName);
          console.log('[ImagePosition] selectedImageElement isConnected:', selectedImageElement?.isConnected);

          // The image element reference might have become stale
          // Try to find it by looking for an image with the same src
          let imageToUse = selectedImageElement;

          // If the element is not connected to DOM, try to find it again
          if (selectedImageElement && !selectedImageElement.isConnected) {
            console.log('[ImagePosition] Element disconnected, trying to find by src...');
            const src = selectedImageElement.src || selectedImageElement.getAttribute('src');
            if (src) {
              // Find all wysiwyg editors and search for the image
              const editors = document.querySelectorAll('.wysiwyg-editor');
              for (const editor of editors) {
                const img = editor.querySelector(`img[src="${src}"]`);
                if (img) {
                  imageToUse = img;
                  console.log('[ImagePosition] Found image by src in editor');
                  break;
                }
              }
            }
          }

          // Find the editor containing this image - try multiple selectors
          let wysiwygEditor = imageToUse?.closest('.wysiwyg-editor');

          // If not found, try other common editor selectors
          if (!wysiwygEditor) {
            wysiwygEditor = imageToUse?.closest('.html-preview');
          }
          if (!wysiwygEditor) {
            wysiwygEditor = imageToUse?.closest('[contenteditable="true"]');
          }
          if (!wysiwygEditor) {
            // Walk up to find any div that might be the editor
            let parent = imageToUse?.parentElement;
            while (parent && parent.tagName !== 'BODY') {
              if (parent.contentEditable === 'true' || parent.getAttribute('contenteditable') === 'true') {
                wysiwygEditor = parent;
                break;
              }
              parent = parent.parentElement;
            }
          }

          console.log('[ImagePosition] Image to use:', !!imageToUse);
          console.log('[ImagePosition] Editor found:', !!wysiwygEditor);
          if (wysiwygEditor) {
            console.log('[ImagePosition] Editor class:', wysiwygEditor.className);
          }

          if (wysiwygEditor && imageToUse) {
            // Apply the styles again to make sure they're on the DOM element
            const { objectFit, objectPosition, scale } = settings;

            // Build style string
            const existingStyle = imageToUse.getAttribute('style') || '';
            let cleanedStyle = existingStyle
              .replace(/object-fit\s*:\s*[^;]+;?/gi, '')
              .replace(/object-position\s*:\s*[^;]+;?/gi, '')
              .replace(/transform\s*:\s*scale\([^)]+\)\s*;?/gi, '')
              .trim();

            const newStyleParts = [];
            if (cleanedStyle) newStyleParts.push(cleanedStyle);
            newStyleParts.push(`object-fit: ${objectFit}`);
            newStyleParts.push(`object-position: ${objectPosition}`);
            if (scale && scale !== 100) {
              newStyleParts.push(`transform: scale(${scale / 100})`);
            }

            const finalStyle = newStyleParts.join('; ') + ';';
            imageToUse.setAttribute('style', finalStyle);

            console.log('[ImagePosition] Applied style:', finalStyle);

            // Now get the HTML
            forceSaveToUndo();
            const newHtml = wysiwygEditor.innerHTML;

            console.log('[ImagePosition] HTML contains object-fit:', newHtml.includes('object-fit'));

            isInternalEditRef.current = true;
            lastContentFromEditorRef.current = newHtml;
            handleChange('content_html', newHtml);
            setSuccessMessage('Đã cập nhật vị trí hình ảnh');
            setTimeout(() => setSuccessMessage(''), 2000);
          } else {
            console.error('[ImagePosition] Could not find editor or image');
            console.error('[ImagePosition] imageToUse:', imageToUse);
            console.error('[ImagePosition] wysiwygEditor:', wysiwygEditor);

            // Last resort: try to find ANY visible wysiwyg editor
            const fallbackEditor = document.querySelector('.wysiwyg-editor');
            if (fallbackEditor) {
              console.log('[ImagePosition] Using fallback editor');
              forceSaveToUndo();
              const newHtml = fallbackEditor.innerHTML;
              isInternalEditRef.current = true;
              lastContentFromEditorRef.current = newHtml;
              handleChange('content_html', newHtml);
              setSuccessMessage('Đã cập nhật (fallback)');
              setTimeout(() => setSuccessMessage(''), 2000);
            } else {
              setError('Không thể lưu thay đổi');
              setTimeout(() => setError(''), 2000);
            }
          }
          setImagePositionModalOpen(false);
          setSelectedImageElement(null);
        }}
      />

      {/* ═══ RESIZE HANDLES OVERLAY ═══ */}
      {/* Temporarily disabled - causing Delete key issues */}
      {/* TODO: Re-enable after fixing focus/keyboard event conflicts */}
      {false && resizeOverlay && resizeOverlay.element && (
        <div
          className={`resize-handles-overlay ${isResizingElement ? 'resizing' : ''}`}
          style={{
            left: resizeOverlay.x,
            top: resizeOverlay.y,
            width: resizeOverlay.width,
            height: resizeOverlay.height,
          }}
        >
          {/* Corner handles */}
          <div
            className="resize-handle handle-nw"
            onMouseDown={(e) => handleElementResizeStart(e, 'nw', resizeOverlay.element)}
          />
          <div
            className="resize-handle handle-ne"
            onMouseDown={(e) => handleElementResizeStart(e, 'ne', resizeOverlay.element)}
          />
          <div
            className="resize-handle handle-sw"
            onMouseDown={(e) => handleElementResizeStart(e, 'sw', resizeOverlay.element)}
          />
          <div
            className="resize-handle handle-se"
            onMouseDown={(e) => handleElementResizeStart(e, 'se', resizeOverlay.element)}
          />
          {/* Edge handles */}
          <div
            className="resize-handle handle-n"
            onMouseDown={(e) => handleElementResizeStart(e, 'n', resizeOverlay.element)}
          />
          <div
            className="resize-handle handle-s"
            onMouseDown={(e) => handleElementResizeStart(e, 's', resizeOverlay.element)}
          />
          <div
            className="resize-handle handle-e"
            onMouseDown={(e) => handleElementResizeStart(e, 'e', resizeOverlay.element)}
          />
          <div
            className="resize-handle handle-w"
            onMouseDown={(e) => handleElementResizeStart(e, 'w', resizeOverlay.element)}
          />
          {/* Size indicator */}
          {isResizingElement && (
            <div className="resize-size-indicator">
              {Math.round(resizeOverlay.width)} × {Math.round(resizeOverlay.height)}
            </div>
          )}
        </div>
      )}

      {/* Context Menu for Copy/Duplicate/Paste */}
      {contextMenu.visible && (
        <div
          className="editor-context-menu"
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            zIndex: 9999998, // Below ImagePositionModal but above fullscreen
            background: 'linear-gradient(180deg, #1a1a2e 0%, #16162a 100%)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
            minWidth: '180px',
            padding: '6px',
            backdropFilter: 'blur(10px)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => handleContextMenuAction('copy')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '10px 14px',
              background: 'transparent',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '13px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
          >
            <Copy size={16} style={{ color: '#00F0FF' }} />
            Copy Component
          </button>
          <button
            onClick={() => handleContextMenuAction('duplicate')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '10px 14px',
              background: 'transparent',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '13px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
          >
            <Layers size={16} style={{ color: '#FFBD59' }} />
            Duplicate
          </button>
          <button
            onClick={() => handleContextMenuAction('paste')}
            disabled={!copiedElement}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '10px 14px',
              background: 'transparent',
              border: 'none',
              borderRadius: '8px',
              color: copiedElement ? '#fff' : 'rgba(255,255,255,0.3)',
              fontSize: '13px',
              cursor: copiedElement ? 'pointer' : 'not-allowed',
              textAlign: 'left',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => { if (copiedElement) e.target.style.background = 'rgba(255, 255, 255, 0.1)'; }}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
          >
            <ClipboardPaste size={16} style={{ color: copiedElement ? '#00F0FF' : 'rgba(255,255,255,0.3)' }} />
            Paste {copiedElement ? '' : '(chưa copy)'}
          </button>
          {/* Download Image - only show if element is or contains an image */}
          {(() => {
            const el = contextMenu.element;
            const imgEl = el?.tagName === 'IMG' ? el : el?.querySelector('img');
            if (!imgEl) return null;
            return (
              <button
                onClick={async () => {
                  try {
                    const response = await fetch(imgEl.src);
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    // Get filename from src or use default
                    const srcParts = imgEl.src.split('/');
                    const filename = srcParts[srcParts.length - 1].split('?')[0] || 'image';
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    setSuccessMessage('Đang tải về...');
                    setTimeout(() => setSuccessMessage(''), 1500);
                  } catch (err) {
                    console.error('Download failed:', err);
                    setError('Không thể tải về');
                  }
                  setContextMenu({ visible: false, x: 0, y: 0, element: null });
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '10px 14px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '13px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
              >
                <Download size={16} style={{ color: '#3b82f6' }} />
                Download Image
              </button>
            );
          })()}
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '6px 0' }} />
          <button
            onClick={() => handleContextMenuAction('delete')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '10px 14px',
              background: 'transparent',
              border: 'none',
              borderRadius: '8px',
              color: '#EF4444',
              fontSize: '13px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.15)'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      )}

      {/* Image Lightbox */}
      {lightboxImage && (
        <div
          className="image-lightbox-overlay"
          onClick={() => setLightboxImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            padding: '40px',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              display: 'flex',
              gap: '8px',
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                const link = document.createElement('a');
                link.href = lightboxImage.image_url;
                link.download = lightboxImage.file_name || lightboxImage.position_id;
                link.click();
              }}
              style={{
                padding: '10px 16px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Download size={16} />
              Tải xuống
            </button>
            <button
              onClick={() => setLightboxImage(null)}
              style={{
                padding: '10px 16px',
                backgroundColor: 'rgba(156, 6, 18, 0.3)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <X size={16} />
              Đóng
            </button>
          </div>

          <div
            style={{
              textAlign: 'center',
              marginBottom: '16px',
              color: '#FFBD59',
              fontFamily: 'monospace',
              fontSize: '14px',
            }}
          >
            {lightboxImage.position_id}
          </div>

          <img
            src={lightboxImage.image_url}
            alt={lightboxImage.position_id}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90vw',
              maxHeight: '80vh',
              objectFit: 'contain',
              borderRadius: '8px',
            }}
          />
        </div>
      )}

    </div>
  );
}
