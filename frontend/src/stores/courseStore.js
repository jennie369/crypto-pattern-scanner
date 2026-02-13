import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { coursesData, hasAccessToChapter, calculateProgress } from '../services/courses';

export const useCourseStore = create(
  persist(
    (set, get) => ({
      // State
      progress: {
        // Structure: { courseId: { completedLessons: [], notes: [], bookmarks: [] } }
      },
      currentCourse: null,
      currentChapter: null,
      userTier: 'free', // Default tier, should be synced with user profile

      // Actions
      setUserTier: (tier) => {
        set({ userTier: tier });
      },

      completeLesson: (courseId, chapterNumber, lessonTitle) => {
        const { progress } = get();
        const courseProgress = progress[courseId] || { completedLessons: [], notes: [], bookmarks: [] };

        const lessonKey = `${chapterNumber}-${lessonTitle}`;

        if (!courseProgress.completedLessons.includes(lessonKey)) {
          set({
            progress: {
              ...progress,
              [courseId]: {
                ...courseProgress,
                completedLessons: [...courseProgress.completedLessons, lessonKey]
              }
            }
          });
        }
      },

      uncompleteLesson: (courseId, chapterNumber, lessonTitle) => {
        const { progress } = get();
        const courseProgress = progress[courseId];

        if (!courseProgress) return;

        const lessonKey = `${chapterNumber}-${lessonTitle}`;

        set({
          progress: {
            ...progress,
            [courseId]: {
              ...courseProgress,
              completedLessons: courseProgress.completedLessons.filter(l => l !== lessonKey)
            }
          }
        });
      },

      isLessonCompleted: (courseId, chapterNumber, lessonTitle) => {
        const { progress } = get();
        const courseProgress = progress[courseId];

        if (!courseProgress) return false;

        const lessonKey = `${chapterNumber}-${lessonTitle}`;
        return courseProgress.completedLessons.includes(lessonKey);
      },

      addNote: (courseId, chapterNumber, lessonTitle, noteText) => {
        const { progress } = get();
        const courseProgress = progress[courseId] || { completedLessons: [], notes: [], bookmarks: [] };

        const note = {
          id: `note-${Date.now()}`,
          chapterNumber,
          lessonTitle,
          text: noteText,
          timestamp: new Date().toISOString()
        };

        set({
          progress: {
            ...progress,
            [courseId]: {
              ...courseProgress,
              notes: [...courseProgress.notes, note]
            }
          }
        });
      },

      updateNote: (courseId, noteId, newText) => {
        const { progress } = get();
        const courseProgress = progress[courseId];

        if (!courseProgress) return;

        set({
          progress: {
            ...progress,
            [courseId]: {
              ...courseProgress,
              notes: courseProgress.notes.map(note =>
                note.id === noteId
                  ? { ...note, text: newText, updatedAt: new Date().toISOString() }
                  : note
              )
            }
          }
        });
      },

      deleteNote: (courseId, noteId) => {
        const { progress } = get();
        const courseProgress = progress[courseId];

        if (!courseProgress) return;

        set({
          progress: {
            ...progress,
            [courseId]: {
              ...courseProgress,
              notes: courseProgress.notes.filter(note => note.id !== noteId)
            }
          }
        });
      },

      getNotes: (courseId, chapterNumber = null, lessonTitle = null) => {
        const { progress } = get();
        const courseProgress = progress[courseId];

        if (!courseProgress) return [];

        let notes = courseProgress.notes;

        if (chapterNumber !== null) {
          notes = notes.filter(note => note.chapterNumber === chapterNumber);
        }

        if (lessonTitle !== null) {
          notes = notes.filter(note => note.lessonTitle === lessonTitle);
        }

        return notes;
      },

      addBookmark: (courseId, chapterNumber, lessonTitle) => {
        const { progress } = get();
        const courseProgress = progress[courseId] || { completedLessons: [], notes: [], bookmarks: [] };

        const bookmark = {
          id: `bookmark-${Date.now()}`,
          chapterNumber,
          lessonTitle,
          timestamp: new Date().toISOString()
        };

        // Check if bookmark already exists
        const exists = courseProgress.bookmarks.some(
          b => b.chapterNumber === chapterNumber && b.lessonTitle === lessonTitle
        );

        if (!exists) {
          set({
            progress: {
              ...progress,
              [courseId]: {
                ...courseProgress,
                bookmarks: [...courseProgress.bookmarks, bookmark]
              }
            }
          });
        }
      },

      removeBookmark: (courseId, chapterNumber, lessonTitle) => {
        const { progress } = get();
        const courseProgress = progress[courseId];

        if (!courseProgress) return;

        set({
          progress: {
            ...progress,
            [courseId]: {
              ...courseProgress,
              bookmarks: courseProgress.bookmarks.filter(
                b => !(b.chapterNumber === chapterNumber && b.lessonTitle === lessonTitle)
              )
            }
          }
        });
      },

      isBookmarked: (courseId, chapterNumber, lessonTitle) => {
        const { progress } = get();
        const courseProgress = progress[courseId];

        if (!courseProgress) return false;

        return courseProgress.bookmarks.some(
          b => b.chapterNumber === chapterNumber && b.lessonTitle === lessonTitle
        );
      },

      getBookmarks: (courseId) => {
        const { progress } = get();
        const courseProgress = progress[courseId];

        if (!courseProgress) return [];

        return courseProgress.bookmarks;
      },

      getCourseProgress: (courseId) => {
        const { progress } = get();
        const courseProgress = progress[courseId];

        if (!courseProgress) {
          return {
            completedLessons: 0,
            totalLessons: 0,
            percentage: 0,
            completedChapters: 0,
            totalChapters: 0
          };
        }

        // Get course data
        const course = coursesData[courseId];
        if (!course) return { completedLessons: 0, totalLessons: 0, percentage: 0 };

        const totalLessons = course.chapters.reduce((sum, chapter) => sum + chapter.lessons.length, 0);
        const completedLessons = courseProgress.completedLessons.length;
        const percentage = calculateProgress({ completedLessons }, totalLessons);

        // Calculate completed chapters (chapter is complete if all lessons are complete)
        const completedChapters = course.chapters.filter(chapter => {
          return chapter.lessons.every(lesson => {
            const lessonKey = `${chapter.number}-${lesson.title}`;
            return courseProgress.completedLessons.includes(lessonKey);
          });
        }).length;

        return {
          completedLessons,
          totalLessons,
          percentage,
          completedChapters,
          totalChapters: course.chapters.length
        };
      },

      getChapterProgress: (courseId, chapterNumber) => {
        const { progress } = get();
        const courseProgress = progress[courseId];

        if (!courseProgress) return { completed: 0, total: 0, percentage: 0 };

        // Get course data
        const course = coursesData[courseId];
        if (!course) return { completed: 0, total: 0, percentage: 0 };

        const chapter = course.chapters.find(ch => ch.number === chapterNumber);
        if (!chapter) return { completed: 0, total: 0, percentage: 0 };

        const total = chapter.lessons.length;
        const completed = chapter.lessons.filter(lesson => {
          const lessonKey = `${chapterNumber}-${lesson.title}`;
          return courseProgress.completedLessons.includes(lessonKey);
        }).length;

        return {
          completed,
          total,
          percentage: total > 0 ? Math.round((completed / total) * 100) : 0
        };
      },

      hasChapterAccess: (chapterTier) => {
        const { userTier } = get();
        return hasAccessToChapter(userTier, chapterTier);
      },

      setCurrentCourse: (courseId) => {
        set({ currentCourse: courseId });
      },

      setCurrentChapter: (chapterNumber) => {
        set({ currentChapter: chapterNumber });
      },

      // Get next lesson recommendation
      getNextLesson: (courseId) => {
        const { progress, userTier } = get();
        const courseProgress = progress[courseId];
        const course = coursesData[courseId];

        if (!course) return null;

        // Find first incomplete lesson that user has access to
        for (const chapter of course.chapters) {
          // Check if user has access to this chapter
          if (!hasAccessToChapter(userTier, chapter.tier)) {
            continue;
          }

          for (const lesson of chapter.lessons) {
            const lessonKey = `${chapter.number}-${lesson.title}`;
            const isCompleted = courseProgress?.completedLessons.includes(lessonKey);

            if (!isCompleted) {
              return {
                chapter: chapter.number,
                chapterTitle: chapter.title,
                lesson: lesson.title,
                lessonDuration: lesson.duration,
                lessonType: lesson.type
              };
            }
          }
        }

        // All accessible lessons completed
        return null;
      },

      // Reset progress for a course
      resetCourseProgress: (courseId) => {
        const { progress } = get();

        set({
          progress: {
            ...progress,
            [courseId]: {
              completedLessons: [],
              notes: [],
              bookmarks: []
            }
          }
        });
      }
    }),
    {
      name: 'gem-course-storage',
      partialize: (state) => ({
        progress: state.progress,
        userTier: state.userTier
      })
    }
  )
);
