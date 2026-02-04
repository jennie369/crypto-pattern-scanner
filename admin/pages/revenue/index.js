/**
 * Revenue Dashboard Page
 * Coming soon placeholder
 */

import React from 'react';

export default function RevenuePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Revenue Dashboard</h1>
        <p className="text-gray-400 mt-1">Track revenue, sales, and financial metrics</p>
      </div>

      <div className="bg-gray-800 rounded-xl p-12 text-center">
        <div className="w-16 h-16 mx-auto bg-green-500/10 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Coming Soon</h2>
        <p className="text-gray-400 max-w-md mx-auto">
          Revenue dashboard with charts, trends, and detailed financial reports will be available in Phase 2.
        </p>
      </div>
    </div>
  );
}
