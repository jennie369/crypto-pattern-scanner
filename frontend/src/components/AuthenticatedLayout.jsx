/**
 * Authenticated Layout Component
 * Wraps all authenticated pages with TopNavBar, CompactSidebar, and conditional Footer
 * Ensures consistent navigation across the entire app
 */

import React from 'react';
import { useLocation } from 'react-router-dom';
import TopNavBar from './TopNavBar';
import Footer from './Footer';
import CompactSidebar from './CompactSidebar/CompactSidebar';

const AuthenticatedLayout = ({ children }) => {
  const location = useLocation();

  // Pages that should show footer (only Home and Landing)
  const showFooter = ['/', '/landing', '/home-v2'].includes(location.pathname);

  return (
    <div className="app-layout-wrapper">
      <TopNavBar />
      <CompactSidebar />
      <div className="page-wrapper compact-sidebar-offset">
        {children}
      </div>
      {/* Conditional Footer - Only show on Home/Landing pages */}
      {showFooter && <Footer />}
    </div>
  );
};

export default AuthenticatedLayout;
