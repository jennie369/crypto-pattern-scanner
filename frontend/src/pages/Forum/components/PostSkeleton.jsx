import React from 'react';
import './PostSkeleton.css';

/**
 * PostSkeleton - Shimmer loading skeleton matching PostCard layout
 * Pure CSS animation, no JS dependencies
 */
export default function PostSkeleton({ count = 1 }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="post-skeleton">
          {/* Header: avatar + name + timestamp */}
          <div className="skeleton-header">
            <div className="skeleton-element skeleton-avatar" />
            <div className="skeleton-author-info">
              <div className="skeleton-element skeleton-name" />
              <div className="skeleton-element skeleton-timestamp" />
            </div>
          </div>

          {/* Content: 3 lines of varying width */}
          <div className="skeleton-content">
            <div className="skeleton-element skeleton-line skeleton-line-full" />
            <div className="skeleton-element skeleton-line skeleton-line-medium" />
            <div className="skeleton-element skeleton-line skeleton-line-short" />
          </div>

          {/* Image placeholder */}
          <div className="skeleton-element skeleton-image" />

          {/* Actions: 4 small bars */}
          <div className="skeleton-actions">
            <div className="skeleton-element skeleton-action" />
            <div className="skeleton-element skeleton-action" />
            <div className="skeleton-element skeleton-action" />
            <div className="skeleton-element skeleton-action" />
          </div>
        </div>
      ))}
    </>
  );
}
