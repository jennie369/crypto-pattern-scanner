/**
 * Confirm Modal Component
 * Reusable confirmation dialog
 */

import React from 'react';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger', // danger, warning, info
  loading = false,
}) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
      iconBg: 'bg-red-500/10',
      iconColor: 'text-red-500',
      buttonBg: 'bg-red-500 hover:bg-red-400',
    },
    warning: {
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-500',
      buttonBg: 'bg-amber-500 hover:bg-amber-400',
    },
    info: {
      icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
      buttonBg: 'bg-blue-500 hover:bg-blue-400',
    },
  };

  const style = variantStyles[variant] || variantStyles.danger;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-start space-x-4">
            <div className={`flex-shrink-0 p-3 rounded-full ${style.iconBg}`}>
              <svg
                className={`w-6 h-6 ${style.iconColor}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={style.icon}
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <p className="mt-2 text-gray-400">{message}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-3 p-4 border-t border-gray-700">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2 ${style.buttonBg}`}
          >
            {loading && (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            )}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
