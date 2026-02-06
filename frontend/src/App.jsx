import React, { lazy, Suspense, useEffect } from 'react';

// Custom error handler for development
if (import.meta.env.DEV) {
  window.addEventListener('error', (e) => {
    console.error('RUNTIME ERROR:', e.message);
    console.error('File:', e.filename);
    console.error('Line:', e.lineno);
    console.error('Stack:', e.error?.stack);
  });

  window.addEventListener('unhandledrejection', (e) => {
    console.error('PROMISE ERROR:', e.reason);
  });
}

import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

// Handle redirect from serverless function fallback
function RedirectHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const redirectPath = sessionStorage.getItem('redirect_path');
    if (redirectPath && redirectPath !== '/') {
      sessionStorage.removeItem('redirect_path');
      navigate(redirectPath, { replace: true });
    }
  }, [navigate]);

  return null;
}
import TopNavBar from './components/TopNavBar';
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
import CourseDetail from './pages/CourseDetail';
import CourseLearning from './pages/CourseLearning';

// Teacher Dashboard - Course Admin
import CourseAdmin from './pages/CourseAdmin';
import CourseBuilder from './pages/CourseAdmin/CourseBuilder';
import ModuleBuilder from './pages/CourseAdmin/ModuleBuilder';
import LessonEditor from './pages/CourseAdmin/LessonEditor';
import QuizBuilder from './pages/CourseAdmin/QuizBuilder';
import StudentManagement from './pages/CourseAdmin/StudentManagement';

// Community Forum
import Forum from './pages/Forum/Forum3Column'; // Updated to 3-column layout
import CreateThread from './pages/Forum/CreateThread';
import ThreadDetail from './pages/Forum/ThreadDetail';

// Direct Messaging
import Messages from './pages/Messages/Messages';

// Events Calendar
import Events from './pages/Events/Events';

// Community Hub (Legacy - for backwards compatibility)
import CommunityHub from './pages/Community/CommunityHub';

// Leaderboard
import Leaderboard from './pages/Community/Leaderboard';

// Gemral Chatbot
import Chatbot from './pages/Chatbot';

// Dashboard (Widgets) - Lazy loaded for performance
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Affiliate Dashboard
import AffiliateDashboard from './pages/AffiliateDashboard';

// Account Dashboard & Profile
import AccountDashboard from './pages/Account/AccountDashboard';
import ProfilePage from './pages/Account/ProfilePage';

// Vision Board
import { VisionBoardPage, CreateGoalPage, GoalDetailPage } from './pages/VisionBoard';

// Trader Rituals
import { RitualsPage, RitualPlaygroundPage } from './pages/Rituals';

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
      <RedirectHandler />
      <TradingModeProvider>
        <div className="app dark">
          <Routes>
          {/* Public Landing Page - Homepage */}
          <Route
            path="/"
            element={<Landing />}
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
              </div>
            }
          />

          {/* Course Detail Page */}
          <Route
            path="/courses/:courseId"
            element={
              <div className="app-layout-wrapper">
                <TopNavBar />
                <div className="page-wrapper">
                  <CourseDetail />
                </div>
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

          {/* Course Learning with specific lesson */}
          <Route
            path="/courses/:courseId/learn/:lessonId"
            element={
              <ProtectedRoute>
                <CourseLearning />
              </ProtectedRoute>
            }
          />

          {/* ═══════════════════════════════════════════════════════════════
              TEACHER DASHBOARD - Course Admin
              Routes for teachers to create and manage courses
              ═══════════════════════════════════════════════════════════════ */}

          {/* Course Admin - Main Dashboard */}
          <Route
            path="/courses/admin"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <CourseAdmin />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          {/* Create New Course */}
          <Route
            path="/courses/admin/create"
            element={
              <ProtectedRoute>
                <CourseBuilder />
              </ProtectedRoute>
            }
          />

          {/* Edit Course */}
          <Route
            path="/courses/admin/edit/:courseId"
            element={
              <ProtectedRoute>
                <CourseBuilder />
              </ProtectedRoute>
            }
          />

          {/* Module Builder - Manage course modules and lessons */}
          <Route
            path="/courses/admin/edit/:courseId/modules"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <ModuleBuilder />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          {/* Create New Lesson */}
          <Route
            path="/courses/admin/edit/:courseId/modules/:moduleId/lessons/new"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <LessonEditor />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          {/* Edit Lesson */}
          <Route
            path="/courses/admin/edit/:courseId/modules/:moduleId/lessons/:lessonId"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <LessonEditor />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          {/* Quiz Builder */}
          <Route
            path="/courses/admin/edit/:courseId/modules/:moduleId/lessons/:lessonId/quiz"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <QuizBuilder />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          {/* Student Management */}
          <Route
            path="/courses/admin/:courseId/students"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <StudentManagement />
                </AuthenticatedLayout>
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

          {/* Gemral Chatbot Route */}
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

          {/* ═══════════════════════════════════════════════════════════════
              VISION BOARD ROUTES
              ═══════════════════════════════════════════════════════════════ */}
          <Route
            path="/vision-board"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <VisionBoardPage />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/vision-board/goals/new"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <CreateGoalPage />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/vision-board/goals/:id"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <GoalDetailPage />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          {/* ═══════════════════════════════════════════════════════════════
              TRADER RITUALS ROUTES
              ═══════════════════════════════════════════════════════════════ */}
          <Route
            path="/rituals"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <RitualsPage />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/rituals/:ritualId"
            element={
              <ProtectedRoute>
                <RitualPlaygroundPage />
              </ProtectedRoute>
            }
          />

          {/* ═══════════════════════════════════════════════════════════════
              COMMUNITY ROUTES - Redirect to Forum (Legacy support)
              ═══════════════════════════════════════════════════════════════ */}

          {/* Redirect old /community routes to /forum */}
          <Route path="/community" element={<Navigate to="/forum" replace />} />
          <Route path="/community/following" element={<Navigate to="/forum?tab=following" replace />} />
          <Route path="/community/trending" element={<Navigate to="/forum?tab=trending" replace />} />
          <Route path="/community/search" element={<Navigate to="/forum" replace />} />
          <Route path="/community/create" element={<Navigate to="/forum/new" replace />} />
          <Route path="/community/post/:postId" element={<Navigate to="/forum/thread/:postId" replace />} />

          {/* Legacy Community Hub - Keep for backwards compatibility */}
          <Route
            path="/community-hub"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <CommunityHub />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/community-hub/:tab"
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
