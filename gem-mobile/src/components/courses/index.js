/**
 * Course Components Index (Mobile)
 */

export { default as HTMLLessonRenderer } from './HTMLLessonRenderer';
export { default as HeroBannerCarousel } from './HeroBannerCarousel';
export { default as CourseCardVertical } from './CourseCardVertical';
export { default as CourseSection } from './CourseSection';
export { default as CategoryChips } from './CategoryChips';
export { default as CourseCategoryGrid } from './CourseCategoryGrid';
export { default as CourseFlashSaleSection, resetFlashSaleCache } from './CourseFlashSaleSection';
export { default as CourseFilterSheet } from './CourseFilterSheet';
export { default as HighlightedCourseSection, resetHighlightedCourseCache } from './HighlightedCourseSection';

// Utility function to reset all course section caches (call on pull-to-refresh)
export const resetAllCourseSectionCaches = () => {
  resetFlashSaleCache();
  resetHighlightedCourseCache();
};
