/**
 * Mobile Navigation Wrapper
 * Converts desktop sidebar to mobile hamburger menu
 */

import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import './MobileNavWrapper.css';

export const MobileNavWrapper = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const closeNav = () => setIsOpen(false);

  return (
    <>
      {/* Mobile hamburger button - Only show on mobile */}
      <button
        className="mobile-nav-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation"
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Nav content */}
      <div className={`mobile-nav-content ${isOpen ? 'open' : ''}`}>
        {/* Close button inside nav */}
        <button
          className="mobile-nav-close"
          onClick={closeNav}
          aria-label="Close navigation"
        >
          <X size={24} />
        </button>

        {/* Actual nav content */}
        <div onClick={closeNav}>
          {children}
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="mobile-nav-backdrop"
          onClick={closeNav}
          aria-hidden="true"
        />
      )}
    </>
  );
};
