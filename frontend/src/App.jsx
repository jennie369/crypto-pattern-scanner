import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import TopNavBar from './components/TopNavBar';
import Footer from './components/Footer';
import AuthenticatedLayout from './components/AuthenticatedLayout';
import Landing from './pages/Landing';
import HomePage from './pages/Home/v2'; // Home Page v2 with AIDA funnel
import Scanner from './pages/Scanner';
import ScannerV2 from './pages/Dashboard/Scanner/v2'; // Scanner Page v2 (Week 3, Day 18-21)
import Analytics from './pages/Analytics';
import History from './pages/History';
import ScanHistory from './pages/ScanHistory';
import Settings from './pages/Settings';
import EnhancedSettings from './pages/EnhancedSettings/EnhancedSettings';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Pricing from './pages/Pricing';
import RiskCalculator from './components/RiskCalculator/RiskCalculator';
import SupabaseTest from './components/SupabaseTest';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import { useAuth } from './contexts/AuthContext';
import { TradingModeProvider } from './contexts/TradingModeContext';

// TIER 2 Components
import TierGuard from './components/TierGuard/TierGuard';
import { PortfolioPage as Portfolio } from './pages/Dashboard/Portfolio/v2/PortfolioPage';
import MTFAnalysis from './pages/MTFAnalysis';
import Sentiment from './pages/Sentiment';
import NewsCalendar from './pages/NewsCalendar';

// TIER 3 Elite Components
import Backtesting from './pages/Backtesting';
import AIPrediction from './pages/AIPrediction';
import WhaleTracker from './pages/WhaleTracker';

// Shop & E-commerce
import Shop from './pages/Shop';
import Cart from './pages/Cart';

// Courses & Education
import Courses from './pages/Courses';
import CourseLearning from './pages/CourseLearning';

// Community Forum
import Forum from './pages/Forum/Forum3Column'; // Updated to 3-column layout
import CreateThread from './pages/Forum/CreateThread';
import ThreadDetail from './pages/Forum/ThreadDetail';

// Direct Messaging
import Messages from './pages/Messages/Messages';

// Events Calendar
import Events from './pages/Events/Events';

// Community Hub (combines all community features)
import CommunityHub from './pages/Community/CommunityHub';

// Leaderboard
import Leaderboard from './pages/Community/Leaderboard';

// Gem Master Chatbot
import Chatbot from './pages/Chatbot';

// Dashboard (Widgets) - Lazy loaded for performance
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Affiliate Dashboard
import AffiliateDashboard from './pages/AffiliateDashboard';

// Account Dashboard & Profile
import AccountDashboard from './pages/Account/AccountDashboard';
import ProfilePage from './pages/Account/ProfilePage';

// Toast Notifications
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Toaster } from 'react-hot-toast'; // For Paper Trading notifications

import './App.css';

/**
 * Main App Component
 * Now uses React Router for navigation between pages
 * Routes are protected with authentication
 */
function App() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <TradingModeProvider>
        <div className="app dark">
          <Routes>
          {/* Public Landing Page - Homepage */}
          <Route
            path="/"
            element={user ? <Navigate to="/scanner-v2" /> : <Landing />}
          />

          {/* Home Page v2 - AIDA Conversion Funnel (Week 3, Day 15-17) */}
          <Route
            path="/home-v2"
            element={<HomePage />}
          />

          {/* Scanner Page v2 - 3-Column Layout (Week 3, Day 18-21) */}
          <Route
            path="/scanner-v2"
            element={
              <div className="app-layout-wrapper">
                <TopNavBar />
                <div className="page-wrapper">
                  <ScannerV2 />
                </div>
                <Footer />
              </div>
            }
          />

          {/* Public Auth Routes */}
          <Route
            path="/login"
            element={user ? <Navigate to="/scanner-v2" /> : <Login />}
          />
          <Route
            path="/signup"
            element={user ? <Navigate to="/scanner-v2" /> : <Signup />}
          />

          {/* Public Pricing Page */}
          <Route
            path="/pricing"
            element={
              <div className="app-layout-wrapper">
                <TopNavBar />
                <div className="page-wrapper">
                  <Pricing />
                </div>
                <Footer />
              </div>
            }
          />

          {/* Shop & E-commerce Routes */}
          <Route
            path="/shop"
            element={
              <div className="app-layout-wrapper">
                <TopNavBar />
                <div className="page-wrapper">
                  <Shop />
                </div>
                <Footer />
              </div>
            }
          />
          <Route
            path="/cart"
            element={
              <div className="app-layout-wrapper">
                <TopNavBar />
                <div className="page-wrapper">
                  <Cart />
                </div>
                <Footer />
              </div>
            }
          />

          {/* Courses & Education Routes */}
          <Route
            path="/courses"
            element={
              <div className="app-layout-wrapper">
                <TopNavBar />
                <div className="page-wrapper">
                  <Courses />
                </div>
                <Footer />
              </div>
            }
          />

          {/* Course Learning Interface - Fullscreen (No Nav/Footer) */}
          <Route
            path="/courses/:courseId/learn"
            element={
              <ProtectedRoute>
                <CourseLearning />
              </ProtectedRoute>
            }
          />

          {/* Community Forum Routes */}
          <Route
            path="/forum"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Forum />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/forum/new"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <CreateThread />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/forum/thread/:threadId"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <ThreadDetail />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          {/* Direct Messaging Route */}
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Messages />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          {/* Events Calendar Route */}
          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Events />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          {/* Leaderboard Route */}
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Leaderboard />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          {/* Gem Master Chatbot Route */}
          <Route
            path="/chatbot"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Chatbot />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          {/* Dashboard (Widgets) Route */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Suspense fallback={<div className="dashboard-loading"><div className="loading-spinner"></div><p>Loading dashboard...</p></div>}>
                    <Dashboard />
                  </Suspense>
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          {/* Affiliate Dashboard Route */}
          <Route
            path="/affiliate"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <AffiliateDashboard />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          {/* Account Dashboard Route */}
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <AccountDashboard />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          {/* Profile Page Route */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <ProfilePage />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          {/* Community Hub Routes - 6-in-1 Navigation */}
          <Route
            path="/community"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <CommunityHub />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/community/:tab"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <CommunityHub />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected Scanner Route */}
          <Route
            path="/scanner"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Scanner />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Analytics />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <History />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/scan-history"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <ScanHistory />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          {/* Enhanced Settings - New comprehensive settings page */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <EnhancedSettings />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          {/* Old Settings - Keep as fallback */}
          <Route
            path="/settings-old"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Settings />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/risk-calculator"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <RiskCalculator />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AuthenticatedLayout>
                  <Admin />
                </AuthenticatedLayout>
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/test"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <SupabaseTest />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          {/* ═══════════════════════════════════════════════════════════════
              TIER 2 ADVANCED TOOLS (Protected by TierGuard)
              Requires scanner_tier >= 'premium' (TIER 2)
              ═══════════════════════════════════════════════════════════════ */}

          {/* TIER 2 - Portfolio Tracker */}
          <Route
            path="/portfolio"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Portfolio />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          {/* TIER 2 - Multi-Timeframe Analysis */}
          <Route
            path="/mtf-analysis"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <MTFAnalysis />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          {/* TIER 2 - Sentiment Analyzer */}
          <Route
            path="/sentiment"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Sentiment />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          {/* TIER 2 - News & Events Calendar */}
          <Route
            path="/news-calendar"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <NewsCalendar />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          {/* ═══════════════════════════════════════════════════════════════
              TIER 3 ELITE TOOLS (Protected by TierGuard)
              Requires scanner_tier >= 'vip' (TIER 3) or course_tier >= 'vip'
              ═══════════════════════════════════════════════════════════════ */}

          {/* TIER 3 - Professional Backtesting Engine */}
          <Route
            path="/tier3/backtesting"
            element={
              <ProtectedRoute>
                <TierGuard requiredTier="TIER3">
                  <AuthenticatedLayout>
                    <Backtesting />
                  </AuthenticatedLayout>
                </TierGuard>
              </ProtectedRoute>
            }
          />

          {/* TIER 3 - AI Prediction Tool (Gemini 2.5 Flash) */}
          <Route
            path="/tier3/ai-prediction"
            element={
              <ProtectedRoute>
                <TierGuard requiredTier="TIER3">
                  <AuthenticatedLayout>
                    <AIPrediction />
                  </AuthenticatedLayout>
                </TierGuard>
              </ProtectedRoute>
            }
          />

          {/* TIER 3 - Whale Tracker (FREE APIs) */}
          <Route
            path="/tier3/whale-tracker"
            element={
              <ProtectedRoute>
                <TierGuard requiredTier="TIER3">
                  <AuthenticatedLayout>
                    <WhaleTracker />
                  </AuthenticatedLayout>
                </TierGuard>
              </ProtectedRoute>
            }
          />

        </Routes>

        {/* Toast Notifications Container */}
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />

        {/* React Hot Toast for Paper Trading */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1a1a2e',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            },
            success: {
              iconTheme: {
                primary: '#00FF88',
                secondary: '#1a1a2e',
              },
            },
            error: {
              iconTheme: {
                primary: '#F6465D',
                secondary: '#1a1a2e',
              },
            },
          }}
        />
        </div>
      </TradingModeProvider>
    </BrowserRouter>
  );
}

export default App;
