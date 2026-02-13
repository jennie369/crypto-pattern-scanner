/**
 * Navigation Reference
 * Exported separately to avoid circular imports
 *
 * Uses React.createRef() for compatibility with all React Navigation versions
 */

import React from 'react';

// Navigation ref for deep linking and global navigation
export const navigationRef = React.createRef();

// Helper to check if navigation is ready
export const isNavigationReady = () => {
  return navigationRef.current?.isReady?.() || navigationRef.current !== null;
};

// Safe navigate function
export const navigate = (name, params) => {
  if (navigationRef.current?.isReady?.()) {
    navigationRef.current.navigate(name, params);
  } else {
    console.warn('[NavigationRef] Navigation not ready, cannot navigate to:', name);
  }
};

export default navigationRef;
