/**
 * LifeAreaSelector Component
 * Filter tabs for life areas
 *
 * @fileoverview Horizontal scrollable filter tabs
 */

import React from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { LIFE_AREAS } from '../../services/visionBoard/goalService';
import './LifeAreaSelector.css';

/**
 * LifeAreaSelector - Filter by life area
 *
 * @param {string} selected - Currently selected area (null for all)
 * @param {Function} onSelect - Selection callback
 * @param {boolean} showAll - Show "All" option
 */
const LifeAreaSelector = ({
  selected = null,
  onSelect,
  showAll = true,
  className = '',
}) => {
  const allOption = {
    key: null,
    label: 'All',
    icon: 'Grid',
    color: '#FFFFFF',
  };

  const options = showAll ? [allOption, ...LIFE_AREAS] : LIFE_AREAS;

  return (
    <div className={`life-area-selector ${className}`}>
      <div className="life-area-selector-scroll">
        {options.map((area) => {
          const Icon = Icons[area.icon] || Icons.Circle;
          const isSelected = selected === area.key;

          return (
            <motion.button
              key={area.key || 'all'}
              className={`life-area-tab ${isSelected ? 'life-area-tab-selected' : ''}`}
              onClick={() => onSelect?.(area.key)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                '--area-color': area.color,
                borderColor: isSelected ? area.color : 'transparent',
                backgroundColor: isSelected ? `${area.color}15` : 'transparent',
              }}
              title={`Filter by ${area.label}`}
            >
              <Icon size={16} style={{ color: area.color }} />
              <span>{area.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default LifeAreaSelector;
