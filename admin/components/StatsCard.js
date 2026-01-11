/**
 * Stats Card Component
 * Displays a statistic with title, value, and optional change indicator
 */

import React from 'react';

export default function StatsCard({
  title,
  value,
  change,
  changeType = 'neutral', // positive, negative, neutral
  icon,
  loading = false,
}) {
  const changeColors = {
    positive: 'text-green-500',
    negative: 'text-red-500',
    neutral: 'text-gray-400',
  };

  const changeIcons = {
    positive: 'M5 10l7-7m0 0l7 7m-7-7v18',
    negative: 'M19 14l-7 7m0 0l-7-7m7 7V3',
    neutral: 'M5 12h14',
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-gray-700 rounded w-3/4"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-2">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center mt-2 ${changeColors[changeType]}`}>
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={changeIcons[changeType]}
                />
              </svg>
              <span className="text-sm">{change}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-amber-500/10 rounded-lg">
            <svg
              className="w-6 h-6 text-amber-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
