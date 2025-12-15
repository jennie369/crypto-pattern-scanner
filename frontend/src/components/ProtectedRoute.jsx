import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 * Shows loading spinner while checking auth state
 */
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Debug log (remove in production)
  console.log('[ProtectedRoute] State:', {
    user: !!user,
    loading,
    path: location.pathname
  });

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0a1628 0%, #1a2642 100%)',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            color: '#FFBD59',
            fontFamily: 'Montserrat, sans-serif',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <div style={{ fontSize: '18px', fontWeight: '600' }}>Đang tải...</div>
        </div>
      </div>
    );
  }

  // Not loading and no user = redirect to login
  if (!user) {
    console.log('[ProtectedRoute] No user, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated, render children
  return children;
}

export default ProtectedRoute;
