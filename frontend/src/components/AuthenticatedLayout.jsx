/**
 * Authenticated Layout Component
 * Wraps all authenticated pages with TopNavBar and CompactSidebar
 * Ensures consistent navigation across the entire app
 */

import React from 'react';
import TopNavBar from './TopNavBar';
import CompactSidebar from './CompactSidebar/CompactSidebar';

const AuthenticatedLayout = ({ children }) => {
  return (
    <div className="app-layout-wrapper">
      <TopNavBar />
      <CompactSidebar />
      <div className="page-wrapper compact-sidebar-offset">
        {children}
      </div>
    </div>
  );
};

export default AuthenticatedLayout;
