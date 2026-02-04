/**
 * Content Hub Page
 * Coming soon placeholder
 */

import React from 'react';

export default function ContentHubPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Content Hub</h1>
        <p className="text-gray-400 mt-1">Manage push notifications, templates, and content calendar</p>
      </div>

      <div className="bg-gray-800 rounded-xl p-12 text-center">
        <div className="w-16 h-16 mx-auto bg-pink-500/10 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Coming Soon</h2>
        <p className="text-gray-400 max-w-md mx-auto">
          Content hub with push notification editor, template library, and content calendar will be available in Phase 5.
        </p>
      </div>
    </div>
  );
}
