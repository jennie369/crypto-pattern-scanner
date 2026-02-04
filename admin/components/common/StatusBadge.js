/**
 * Status Badge Component
 * Displays status with color indicator
 */

import React from 'react';

const statusConfig = {
  active: {
    label: 'Active',
    bg: 'bg-green-500/20',
    text: 'text-green-500',
    dot: 'bg-green-500',
  },
  inactive: {
    label: 'Inactive',
    bg: 'bg-gray-500/20',
    text: 'text-gray-400',
    dot: 'bg-gray-500',
  },
  scheduled: {
    label: 'Scheduled',
    bg: 'bg-blue-500/20',
    text: 'text-blue-500',
    dot: 'bg-blue-500',
  },
  expired: {
    label: 'Expired',
    bg: 'bg-red-500/20',
    text: 'text-red-500',
    dot: 'bg-red-500',
  },
  draft: {
    label: 'Draft',
    bg: 'bg-yellow-500/20',
    text: 'text-yellow-500',
    dot: 'bg-yellow-500',
  },
  pending: {
    label: 'Pending',
    bg: 'bg-amber-500/20',
    text: 'text-amber-500',
    dot: 'bg-amber-500',
  },
  approved: {
    label: 'Approved',
    bg: 'bg-green-500/20',
    text: 'text-green-500',
    dot: 'bg-green-500',
  },
  rejected: {
    label: 'Rejected',
    bg: 'bg-red-500/20',
    text: 'text-red-500',
    dot: 'bg-red-500',
  },
};

export default function StatusBadge({ status, customLabel, showDot = true }) {
  const config = statusConfig[status] || statusConfig.inactive;
  const label = customLabel || config.label;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot} mr-1.5`} />
      )}
      {label}
    </span>
  );
}

export function getStatusFromDates(isActive, startDate, endDate) {
  if (!isActive) return 'inactive';

  const now = new Date();
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  if (start && now < start) return 'scheduled';
  if (end && now > end) return 'expired';

  return 'active';
}
