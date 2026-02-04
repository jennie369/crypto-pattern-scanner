/**
 * Courses Management Page
 * Coming soon placeholder
 */

import React from 'react';

export default function CoursesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Courses</h1>
        <p className="text-gray-400 mt-1">Manage courses, modules, lessons, and quizzes</p>
      </div>

      <div className="bg-gray-800 rounded-xl p-12 text-center">
        <div className="w-16 h-16 mx-auto bg-amber-500/10 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Coming Soon</h2>
        <p className="text-gray-400 max-w-md mx-auto">
          Full course management system with drag-drop course builder, module organization, and quiz creation will be available in Phase 3.
        </p>
      </div>
    </div>
  );
}
