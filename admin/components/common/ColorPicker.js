/**
 * Color Picker Component
 * Simple color input with preset colors
 */

import React, { useState } from 'react';

const presetColors = [
  '#FF4757', // Red
  '#FF6B7A', // Light Red
  '#FF8C00', // Orange
  '#FFBD59', // Gold
  '#FFD700', // Yellow
  '#2ED573', // Green
  '#1E90FF', // Blue
  '#5352ED', // Purple
  '#9C0612', // Burgundy
  '#1a0b2e', // Dark Purple
  '#2d1b4e', // Medium Purple
  '#FFFFFF', // White
  '#000000', // Black
];

export default function ColorPicker({
  label,
  value,
  onChange,
  showPresets = true,
  className = '',
}) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          className="w-10 h-10 rounded-lg border-2 border-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
          style={{ backgroundColor: value }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          placeholder="#FFFFFF"
        />
      </div>

      {showPicker && showPresets && (
        <div className="absolute z-10 mt-2 p-3 bg-gray-700 rounded-lg shadow-xl border border-gray-600">
          <div className="grid grid-cols-5 gap-2">
            {presetColors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => {
                  onChange(color);
                  setShowPicker(false);
                }}
                className={`w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110 ${
                  value === color ? 'border-amber-500 ring-2 ring-amber-500/50' : 'border-gray-500'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-600">
            <input
              type="color"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full h-8 rounded cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
}
