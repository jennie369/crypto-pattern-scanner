/**
 * Course Components Index (Mobile)
 */

export { default as HTMLLessonRenderer } from './HTMLLessonRenderer';
export { default as HeroBannerCarousel } from './HeroBannerCarousel';
export { default as CourseCardVertical } from './CourseCardVertical';
export { default as CourseSection } from './CourseSection';
export { default as CategoryChips } from './CategoryChips';
export { default as CourseCategoryGrid } from './CourseCategoryGrid';
export { default as CourseFlashSaleSection } from './CourseFlashSaleSection';
export { default as CourseFilterSheet } from './CourseFilterSheet';
export { default as HighlightedCourseSection } from './HighlightedCourseSection';

// Import cache reset functions separately for safer bundling
import { resetFlashSaleCache } from './CourseFlashSaleSection';
import { resetHighlightedCourseCache } from './HighlightedCourseSection';
import { resetBannerCache } from './HeroBannerCarousel';

// Re-export the reset functions
export { resetFlashSaleCache, resetHighlightedCourseCache, resetBannerCache };

// Utility function to reset all course section caches (call on pull-to-refresh)
export const resetAllCourseSectionCaches = () => {
  if (typeof resetFlashSaleCache === 'function') {
    resetFlashSaleCache();
  }
  if (typeof resetHighlightedCourseCache === 'function') {
    resetHighlightedCourseCache();
  }
  if (typeof resetBannerCache === 'function') {
    resetBannerCache();
  }
};
