import React from 'react';
import { Pin } from 'lucide-react';
import './PinnedBadge.css';

/**
 * PinnedBadge - Inline badge for pinned posts
 * Shows pin icon + "Đã ghim" text
 */
export default function PinnedBadge() {
  return (
    <span className="pinned-badge">
      <Pin size={12} />
      <span className="pinned-badge-text">Đã ghim</span>
    </span>
  );
}
