import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import TopNavBar from './components/TopNavBar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import HomePage from './pages/Home/v2'; // Home Page v2 with AIDA funnel
import Scanner from './pages/Scanner';
import ScannerV2 from './pages/Dashboard/Scanner/v2'; // Scanner Page v2 (Week 3, Day 18-21)
import Analytics from './pages/Analytics';
import History from './pages/History';
import ScanHistory from './pages/ScanHistory';
import Settings from './pages/Settings';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Pricing from './pages/Pricing';
import RiskCalculator from './components/RiskCalculator/RiskCalculator';
import SupabaseTest from './components/SupabaseTest';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import { useAuth } from './contexts/AuthContext';

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
      <div className="app dark">
        <Routes>
          {/* Public Landing Page - Homepage */}
          <Route
            path="/"
            element={user ? <Navigate to="/scanner" /> : <Landing />}
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
            element={user ? <Navigate to="/scanner" /> : <Login />}
          />
          <Route
            path="/signup"
            element={user ? <Navigate to="/scanner" /> : <Signup />}
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

          {/* Protected Scanner Route */}
          <Route
            path="/scanner"
            element={
              <ProtectedRoute>
                <div className="app-layout-wrapper">
                  <TopNavBar />
                  <div className="page-wrapper">
                    <Scanner />
                  </div>
                  <Footer />
                </div>
              </ProtectedRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <div className="app-layout-wrapper">
                  <TopNavBar />
                  <div className="page-wrapper">
                    <Analytics />
                  </div>
                  <Footer />
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <div className="app-layout-wrapper">
                  <TopNavBar />
                  <div className="page-wrapper">
                    <History />
                  </div>
                  <Footer />
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/scan-history"
            element={
              <ProtectedRoute>
                <div className="app-layout-wrapper">
                  <TopNavBar />
                  <div className="page-wrapper">
                    <ScanHistory />
                  </div>
                  <Footer />
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <div className="app-layout-wrapper">
                  <TopNavBar />
                  <div className="page-wrapper">
                    <Settings />
                  </div>
                  <Footer />
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/risk-calculator"
            element={
              <ProtectedRoute>
                <div className="app-layout-wrapper">
                  <TopNavBar />
                  <div className="page-wrapper">
                    <RiskCalculator />
                  </div>
                  <Footer />
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <div className="app-layout-wrapper">
                  <TopNavBar />
                  <div className="page-wrapper">
                    <Admin />
                  </div>
                  <Footer />
                </div>
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/test"
            element={
              <ProtectedRoute>
                <div className="app-layout-wrapper">
                  <TopNavBar />
                  <div className="page-wrapper">
                    <SupabaseTest />
                  </div>
                  <Footer />
                </div>
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
                <div className="app-layout-wrapper">
                  <TopNavBar />
                  <div className="page-wrapper">
                    <Portfolio />
                  </div>
                  <Footer />
                </div>
              </ProtectedRoute>
            }
          />

          {/* TIER 2 - Multi-Timeframe Analysis */}
          <Route
            path="/mtf-analysis"
            element={
              <ProtectedRoute>
                <div className="app-layout-wrapper">
                  <TopNavBar />
                  <div className="page-wrapper">
                    <MTFAnalysis />
                  </div>
                  <Footer />
                </div>
              </ProtectedRoute>
            }
          />

          {/* TIER 2 - Sentiment Analyzer */}
          <Route
            path="/sentiment"
            element={
              <ProtectedRoute>
                <div className="app-layout-wrapper">
                  <TopNavBar />
                  <div className="page-wrapper">
                    <Sentiment />
                  </div>
                  <Footer />
                </div>
              </ProtectedRoute>
            }
          />

          {/* TIER 2 - News & Events Calendar */}
          <Route
            path="/news-calendar"
            element={
              <ProtectedRoute>
                <div className="app-layout-wrapper">
                  <TopNavBar />
                  <div className="page-wrapper">
                    <NewsCalendar />
                  </div>
                  <Footer />
                </div>
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
                  <div className="app-layout-wrapper">
                    <TopNavBar />
                    <div className="page-wrapper">
                      <Backtesting />
                    </div>
                    <Footer />
                  </div>
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
                  <div className="app-layout-wrapper">
                    <TopNavBar />
                    <div className="page-wrapper">
                      <AIPrediction />
                    </div>
                    <Footer />
                  </div>
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
                  <div className="app-layout-wrapper">
                    <TopNavBar />
                    <div className="page-wrapper">
                      <WhaleTracker />
                    </div>
                    <Footer />
                  </div>
                </TierGuard>
              </ProtectedRoute>
            }
          />

        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
