import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import VideoPlayer from '../components/VideoPlayer';
import { GraduationCap, BookOpen, Video, CheckCircle, Play, Lock, FileText, StickyNote, Bookmark, Trash2 } from 'lucide-react';
import './CourseLearning.css';

// Sample course data - In production, this would come from API/Supabase
const coursesData = {
  'crypto-basics': {
    id: 'crypto-basics',
    title: 'Crypto Trading Basics',
    instructor: 'Gem Master',
    requiredTier: 'FREE',
    chapters: [
      {
        id: 1,
        title: 'Getting Started',
        lessons: [
          {
            id: 1,
            title: 'Welcome to Crypto Trading',
            duration: '5:30',
            videoUrl: '/videos/sample.mp4',
            content: `
# Welcome to Crypto Trading

In this lesson, you'll learn:
- What is cryptocurrency
- How trading works
- Basic terminology
- Getting started with exchanges

## Key Concepts:
1. **Blockchain**: Distributed ledger technology
2. **Cryptocurrency**: Digital currency secured by cryptography
3. **Exchange**: Platform for buying/selling crypto
4. **Wallet**: Storage for your crypto assets

## Important Notes:
⚠️ Never invest more than you can afford to lose
✅ Always use 2FA on exchanges
📚 Continue learning before trading real money
            `,
            free: true
          },
          {
            id: 2,
            title: 'Understanding Market Structure',
            duration: '8:45',
            videoUrl: '/videos/sample.mp4',
            content: `
# Understanding Market Structure

## Market Phases:
1. **Accumulation**: Smart money buying
2. **Markup**: Uptrend begins
3. **Distribution**: Smart money selling
4. **Markdown**: Downtrend

## Key Levels:
- Support zones
- Resistance zones
- Supply and demand
            `,
            free: false
          }
        ]
      },
      {
        id: 2,
        title: 'Technical Analysis',
        lessons: [
          {
            id: 3,
            title: 'Candlestick Patterns',
            duration: '12:20',
            videoUrl: '/videos/sample.mp4',
            content: `
# Candlestick Patterns

## Reversal Patterns:
- Hammer & Inverted Hammer
- Shooting Star
- Engulfing (Bullish & Bearish)
- Morning Star & Evening Star

## Continuation Patterns:
- Rising Three Methods
- Falling Three Methods
- Three White Soldiers
- Three Black Crows
            `,
            free: false
          }
        ]
      }
    ]
  },
  'advanced-patterns': {
    id: 'advanced-patterns',
    title: 'Advanced Pattern Recognition',
    instructor: 'Gem Master Pro',
    requiredTier: 'TIER2',
    chapters: [
      {
        id: 1,
        title: 'Advanced Patterns',
        lessons: [
          {
            id: 1,
            title: 'Wyckoff Method',
            duration: '15:30',
            videoUrl: '/videos/sample.mp4',
            content: '# Wyckoff Method\n\nAdvanced accumulation and distribution...',
            free: false
          }
        ]
      }
    ]
  }
};

export default function CourseLearning() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [activeTab, setActiveTab] = useState('content'); // content, notes, bookmarks
  const [progress, setProgress] = useState(0);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [notes, setNotes] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    // Load course data
    const courseData = coursesData[courseId];
    if (!courseData) {
      navigate('/courses');
      return;
    }

    setCourse(courseData);

    // Load lesson from URL or default to first lesson
    const lessonId = parseInt(searchParams.get('lesson')) || 1;
    loadLesson(courseData, lessonId);

    // Load user progress (from localStorage for demo, would be Supabase in production)
    loadProgress(courseId);
  }, [courseId, searchParams]);

  const loadLesson = (courseData, lessonId) => {
    for (const chapter of courseData.chapters) {
      const lesson = chapter.lessons.find(l => l.id === lessonId);
      if (lesson) {
        setCurrentLesson({ ...lesson, chapterId: chapter.id, chapterTitle: chapter.title });
        return;
      }
    }
  };

  const loadProgress = (courseId) => {
    const saved = localStorage.getItem(`course_progress_${courseId}`);
    if (saved) {
      const data = JSON.parse(saved);
      setCompletedLessons(data.completed || []);
      setNotes(data.notes || []);
      setBookmarks(data.bookmarks || []);
    }
  };

  const saveProgress = () => {
    const data = {
      completed: completedLessons,
      notes,
      bookmarks
    };
    localStorage.setItem(`course_progress_${courseId}`, JSON.stringify(data));
  };

  const handleLessonSelect = (lesson, chapterId, chapterTitle) => {
    // Check access
    if (!lesson.free && !hasAccess()) {
      alert('Nâng cấp tài khoản để mở khóa bài học này');
      return;
    }

    setCurrentLesson({ ...lesson, chapterId, chapterTitle });
    setSearchParams({ lesson: lesson.id });
    setProgress(0);
  };

  const hasAccess = () => {
    if (!course) return false;
    const userTier = user?.scanner_tier || 'FREE';
    const tierHierarchy = { 'FREE': 0, 'TIER1': 1, 'TIER2': 2, 'TIER3': 3 };
    return tierHierarchy[userTier] >= tierHierarchy[course.requiredTier];
  };

  const handleVideoProgress = (progress) => {
    setProgress(progress);

    // Mark as complete when 90% watched
    if (progress > 0.9 && currentLesson && !completedLessons.includes(currentLesson.id)) {
      const newCompleted = [...completedLessons, currentLesson.id];
      setCompletedLessons(newCompleted);
      setTimeout(saveProgress, 100);
    }
  };

  const handleVideoEnd = () => {
    // Auto-play next lesson
    const nextLesson = getNextLesson();
    if (nextLesson) {
      setTimeout(() => {
        handleLessonSelect(nextLesson.lesson, nextLesson.chapterId, nextLesson.chapterTitle);
      }, 2000);
    }
  };

  const handleAddNote = (note) => {
    const newNote = {
      ...note,
      lessonId: currentLesson.id,
      lessonTitle: currentLesson.title,
      id: Date.now()
    };
    setNotes([...notes, newNote]);
    setTimeout(saveProgress, 100);
  };

  const handleAddBookmark = (bookmark) => {
    const newBookmark = {
      ...bookmark,
      lessonId: currentLesson.id,
      lessonTitle: currentLesson.title,
      id: Date.now()
    };
    setBookmarks([...bookmarks, newBookmark]);
    setTimeout(saveProgress, 100);
  };

  const deleteNote = (noteId) => {
    setNotes(notes.filter(n => n.id !== noteId));
    setTimeout(saveProgress, 100);
  };

  const deleteBookmark = (bookmarkId) => {
    setBookmarks(bookmarks.filter(b => b.id !== bookmarkId));
    setTimeout(saveProgress, 100);
  };

  const getPreviousLesson = () => {
    if (!course || !currentLesson) return null;

    let allLessons = [];
    course.chapters.forEach(chapter => {
      chapter.lessons.forEach(lesson => {
        allLessons.push({ lesson, chapterId: chapter.id, chapterTitle: chapter.title });
      });
    });

    const currentIndex = allLessons.findIndex(l => l.lesson.id === currentLesson.id);
    return currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  };

  const getNextLesson = () => {
    if (!course || !currentLesson) return null;

    let allLessons = [];
    course.chapters.forEach(chapter => {
      chapter.lessons.forEach(lesson => {
        allLessons.push({ lesson, chapterId: chapter.id, chapterTitle: chapter.title });
      });
    });

    const currentIndex = allLessons.findIndex(l => l.lesson.id === currentLesson.id);
    return currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  };

  const calculateCourseProgress = () => {
    if (!course) return 0;
    let totalLessons = 0;
    course.chapters.forEach(c => totalLessons += c.lessons.length);
    return totalLessons > 0 ? (completedLessons.length / totalLessons) * 100 : 0;
  };

  if (!course || !currentLesson) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Đang tải khóa học...</p>
      </div>
    );
  }

  const previousLesson = getPreviousLesson();
  const nextLesson = getNextLesson();
  const courseProgress = calculateCourseProgress();

  return (
    <div className="course-learning-page">
      {/* Sidebar */}
      <aside className={`course-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <button
            onClick={() => navigate('/courses')}
            className="btn-back"
            title="Quay lại danh sách khóa học"
          >
            ← Courses
          </button>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="btn-toggle-sidebar"
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        {!sidebarCollapsed && (
          <>
            <div className="course-info">
              <h2 className="course-title">{course.title}</h2>
              <p className="course-instructor"><GraduationCap size={16} style={{ display: 'inline-block', marginRight: '6px', verticalAlign: 'middle' }} /> {course.instructor}</p>

              <div className="progress-card">
                <div className="progress-header">
                  <span className="progress-label">Tiến Độ</span>
                  <span className="progress-percent">{Math.round(courseProgress)}%</span>
                </div>
                <div className="progress-bar-container">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${courseProgress}%` }}
                  />
                </div>
                <p className="progress-stats">
                  {completedLessons.length} / {course.chapters.reduce((sum, c) => sum + c.lessons.length, 0)} bài học
                </p>
              </div>
            </div>

            <div className="chapters-list">
              {course.chapters.map(chapter => (
                <div key={chapter.id} className="chapter-section">
                  <h3 className="chapter-title">
                    <BookOpen size={18} style={{ display: 'inline-block', marginRight: '6px', verticalAlign: 'middle' }} /> {chapter.title}
                  </h3>
                  <div className="lessons-list">
                    {chapter.lessons.map(lesson => {
                      const isActive = currentLesson.id === lesson.id;
                      const isCompleted = completedLessons.includes(lesson.id);
                      const isLocked = !lesson.free && !hasAccess();

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => handleLessonSelect(lesson, chapter.id, chapter.title)}
                          className={`lesson-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`}
                          disabled={isLocked}
                        >
                          <div className="lesson-icon">
                            {isLocked ? <Lock size={16} /> : isCompleted ? <CheckCircle size={16} /> : isActive ? <Play size={16} /> : <Video size={16} />}
                          </div>
                          <div className="lesson-info">
                            <span className="lesson-title">{lesson.title}</span>
                            <span className="lesson-duration">{lesson.duration}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </aside>

      {/* Main Content */}
      <main className="learning-content">
        {/* Video Player */}
        <div className="video-section">
          <VideoPlayer
            url={currentLesson.videoUrl}
            onProgress={handleVideoProgress}
            onEnded={handleVideoEnd}
            savedProgress={progress}
            onAddNote={handleAddNote}
            onAddBookmark={handleAddBookmark}
          />

          <div className="lesson-header">
            <div className="lesson-meta">
              <span className="chapter-badge">{currentLesson.chapterTitle}</span>
              <h1 className="lesson-title">{currentLesson.title}</h1>
            </div>
            <div className="lesson-actions">
              {previousLesson && (
                <button
                  onClick={() => handleLessonSelect(previousLesson.lesson, previousLesson.chapterId, previousLesson.chapterTitle)}
                  className="btn-secondary"
                >
                  ← Bài Trước
                </button>
              )}
              {nextLesson && (
                <button
                  onClick={() => handleLessonSelect(nextLesson.lesson, nextLesson.chapterId, nextLesson.chapterTitle)}
                  className="btn-primary"
                >
                  Bài Tiếp →
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="content-tabs">
          <div className="tabs-header">
            <button
              onClick={() => setActiveTab('content')}
              className={`tab-btn ${activeTab === 'content' ? 'active' : ''}`}
            >
              <FileText size={18} style={{ marginRight: '6px' }} /> Nội Dung
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
            >
              <StickyNote size={18} style={{ marginRight: '6px' }} /> Ghi Chú ({notes.filter(n => n.lessonId === currentLesson.id).length})
            </button>
            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`tab-btn ${activeTab === 'bookmarks' ? 'active' : ''}`}
            >
              <Bookmark size={18} style={{ marginRight: '6px' }} /> Đánh Dấu ({bookmarks.filter(b => b.lessonId === currentLesson.id).length})
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'content' && (
              <div className="content-panel">
                <div className="markdown-content">
                  {currentLesson.content.split('\n').map((line, i) => {
                    if (line.startsWith('# ')) return <h1 key={i}>{line.slice(2)}</h1>;
                    if (line.startsWith('## ')) return <h2 key={i}>{line.slice(3)}</h2>;
                    if (line.startsWith('### ')) return <h3 key={i}>{line.slice(4)}</h3>;
                    if (line.startsWith('- ')) return <li key={i}>{line.slice(2)}</li>;
                    if (line.match(/^\d+\./)) return <li key={i}>{line}</li>;
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return <p key={i}><strong>{line.slice(2, -2)}</strong></p>;
                    }
                    if (line.trim() === '') return <br key={i} />;
                    return <p key={i}>{line}</p>;
                  })}
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="notes-panel">
                {notes.filter(n => n.lessonId === currentLesson.id).length === 0 ? (
                  <div className="empty-state">
                    <p><StickyNote size={48} style={{ margin: '0 auto 16px', display: 'block' }} /></p>
                    <p>Chưa có ghi chú nào cho bài học này</p>
                    <p className="hint">Sử dụng nút ghi chú trên video player để thêm ghi chú</p>
                  </div>
                ) : (
                  <div className="notes-list">
                    {notes
                      .filter(n => n.lessonId === currentLesson.id)
                      .sort((a, b) => a.timestamp - b.timestamp)
                      .map(note => (
                        <div key={note.id} className="note-card">
                          <div className="note-header">
                            <span className="note-time">{note.formattedTime}</span>
                            <button
                              onClick={() => deleteNote(note.id)}
                              className="btn-delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <p className="note-text">{note.text}</p>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'bookmarks' && (
              <div className="bookmarks-panel">
                {bookmarks.filter(b => b.lessonId === currentLesson.id).length === 0 ? (
                  <div className="empty-state">
                    <p><Bookmark size={48} style={{ margin: '0 auto 16px', display: 'block' }} /></p>
                    <p>Chưa có bookmark nào cho bài học này</p>
                    <p className="hint">Sử dụng nút bookmark trên video player để đánh dấu</p>
                  </div>
                ) : (
                  <div className="bookmarks-list">
                    {bookmarks
                      .filter(b => b.lessonId === currentLesson.id)
                      .sort((a, b) => a.timestamp - b.timestamp)
                      .map(bookmark => (
                        <div key={bookmark.id} className="bookmark-card">
                          <div className="bookmark-header">
                            <span className="bookmark-time"><Bookmark size={16} style={{ display: 'inline-block', marginRight: '6px', verticalAlign: 'middle' }} /> {bookmark.formattedTime}</span>
                            <button
                              onClick={() => deleteBookmark(bookmark.id)}
                              className="btn-delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
