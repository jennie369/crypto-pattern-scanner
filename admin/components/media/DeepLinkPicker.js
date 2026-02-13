/**
 * Deep Link Picker Component
 * Select link type and value for banner navigation
 */

import React, { useState } from 'react';

const linkTypes = [
  {
    value: 'none',
    label: 'No Link',
    description: 'Banner is not clickable',
    icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636',
  },
  {
    value: 'screen',
    label: 'App Screen',
    description: 'Navigate to an app screen',
    icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z',
  },
  {
    value: 'product',
    label: 'Product',
    description: 'Open a specific product',
    icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  },
  {
    value: 'collection',
    label: 'Collection',
    description: 'Open a product collection',
    icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
  },
  {
    value: 'course',
    label: 'Course',
    description: 'Open a specific course',
    icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  },
  {
    value: 'url',
    label: 'External URL',
    description: 'Open an external webpage',
    icon: 'M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14',
  },
];

const appScreens = [
  { value: 'Shop', label: 'Shop Tab' },
  { value: 'Courses', label: 'Courses Tab' },
  { value: 'Scanner', label: 'Scanner Tab' },
  { value: 'VisionBoard', label: 'Vision Board' },
  { value: 'Profile', label: 'Profile' },
  { value: 'Settings', label: 'Settings' },
  { value: 'Notifications', label: 'Notifications' },
  { value: 'Messages', label: 'Messages' },
  { value: 'TradingJournal', label: 'Trading Journal' },
  { value: 'Manifest', label: 'Manifest' },
];

export default function DeepLinkPicker({
  linkType,
  linkValue,
  onLinkTypeChange,
  onLinkValueChange,
  className = '',
}) {
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  const selectedType = linkTypes.find(t => t.value === linkType) || linkTypes[0];

  const renderValueInput = () => {
    switch (linkType) {
      case 'none':
        return null;

      case 'screen':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Screen
            </label>
            <select
              value={linkValue || ''}
              onChange={(e) => onLinkValueChange(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Select a screen...</option>
              {appScreens.map((screen) => (
                <option key={screen.value} value={screen.value}>
                  {screen.label}
                </option>
              ))}
            </select>
          </div>
        );

      case 'product':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Product ID / Handle
            </label>
            <input
              type="text"
              value={linkValue || ''}
              onChange={(e) => onLinkValueChange(e.target.value)}
              placeholder="e.g., gid://shopify/Product/123456 or product-handle"
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter Shopify product ID or handle
            </p>
          </div>
        );

      case 'collection':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Collection ID / Handle
            </label>
            <input
              type="text"
              value={linkValue || ''}
              onChange={(e) => onLinkValueChange(e.target.value)}
              placeholder="e.g., gid://shopify/Collection/123456 or collection-handle"
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter Shopify collection ID or handle
            </p>
          </div>
        );

      case 'course':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Course ID
            </label>
            <input
              type="text"
              value={linkValue || ''}
              onChange={(e) => onLinkValueChange(e.target.value)}
              placeholder="e.g., course-uuid-123"
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter course UUID from database
            </p>
          </div>
        );

      case 'url':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              URL
            </label>
            <input
              type="url"
              value={linkValue || ''}
              onChange={(e) => onLinkValueChange(e.target.value)}
              placeholder="https://example.com"
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter full URL including https://
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={className}>
      {/* Link Type Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Link Type
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowTypeDropdown(!showTypeDropdown)}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-amber-500 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-600 rounded-lg">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={selectedType.icon} />
                </svg>
              </div>
              <div>
                <div className="font-medium">{selectedType.label}</div>
                <div className="text-xs text-gray-400">{selectedType.description}</div>
              </div>
            </div>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${showTypeDropdown ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showTypeDropdown && (
            <div className="absolute z-10 mt-2 w-full bg-gray-700 rounded-lg shadow-xl border border-gray-600 overflow-hidden">
              {linkTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => {
                    onLinkTypeChange(type.value);
                    if (type.value === 'none') {
                      onLinkValueChange('');
                    }
                    setShowTypeDropdown(false);
                  }}
                  className={`w-full px-4 py-3 text-left flex items-center space-x-3 hover:bg-gray-600 transition-colors ${
                    linkType === type.value ? 'bg-amber-500/20' : ''
                  }`}
                >
                  <div className={`p-2 rounded-lg ${linkType === type.value ? 'bg-amber-500/20' : 'bg-gray-600'}`}>
                    <svg
                      className={`w-5 h-5 ${linkType === type.value ? 'text-amber-500' : 'text-gray-400'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={type.icon} />
                    </svg>
                  </div>
                  <div>
                    <div className={`font-medium ${linkType === type.value ? 'text-amber-500' : 'text-white'}`}>
                      {type.label}
                    </div>
                    <div className="text-xs text-gray-400">{type.description}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Link Value Input */}
      {renderValueInput()}
    </div>
  );
}
