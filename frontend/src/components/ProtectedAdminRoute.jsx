import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * ProtectedAdminRoute - Route protection for admin-only pages
 * Redirects non-admin users to home page with access denied message
 */
export default function ProtectedAdminRoute({ children }) {
  const { user, profile, loading, isAdmin } = useAuth();

  // Still loading auth state
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #112250 0%, #2A1B52 50%, #4A1942 100%)',
        color: '#FFBD59'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '4px solid rgba(255, 189, 89, 0.2)',
          borderTopColor: '#FFBD59',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ marginTop: '20px', fontSize: '16px', fontWeight: '600' }}>
          Loading...
        </p>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    alert('⚠️ Vui lòng đăng nhập để truy cập trang Admin!');
    return <Navigate to="/" replace />;
  }

  // Not admin
  if (!isAdmin()) {
    alert('🚫 Bạn không có quyền truy cập trang Admin!');
    return <Navigate to="/" replace />;
  }

  // Is admin - allow access
  return children;
}
