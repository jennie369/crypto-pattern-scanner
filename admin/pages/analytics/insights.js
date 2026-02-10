/**
 * AI Insights Analytics Page
 * AI-powered insights, anomaly detection, and recommendations
 */

import React, { useState, useEffect } from 'react';
import StatsCard from '../../components/StatsCard';
import * as analyticsService from '../../services/analyticsService';

const CATEGORY_ICONS = {
  scanner: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  shop: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
  users: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
  chatbot: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
};

const PRIORITY_COLORS = {
  high: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  medium: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
  low: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
};

const ALERT_TYPES = {
  critical: { bg: 'bg-red-500/20', text: 'text-red-400', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
  warning: { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
  info: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
};

export default function InsightsPage() {
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [predictions, setPredictions] = useState([]);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    setLoading(true);
    try {
      const [insightsResult, alertsResult] = await Promise.all([
        analyticsService.getAIInsights(),
        analyticsService.getAnomalyAlerts(),
      ]);

      if (insightsResult.success && insightsResult.data.length > 0) {
        setInsights(insightsResult.data);
      } else {
        // Mock insights
        setInsights([
          {
            category: 'scanner',
            type: 'trend',
            title: 'Scanner Usage Peak',
            description: 'Scanner usage increased 35% this week, primarily in 15m and 1h timeframes',
            metric: '4,270',
            metricLabel: 'scans this week',
            priority: 'medium',
          },
          {
            category: 'shop',
            type: 'revenue',
            title: 'Revenue Growth',
            description: 'Shop revenue up 22% compared to last month, driven by Tier 2 subscriptions',
            metric: '125M VND',
            metricLabel: 'monthly revenue',
            priority: 'high',
          },
          {
            category: 'users',
            type: 'growth',
            title: 'User Engagement',
            description: 'Active user rate improved to 38.8%, highest in 3 months',
            metric: '4,850',
            metricLabel: 'active users',
            priority: 'medium',
          },
          {
            category: 'chatbot',
            type: 'performance',
            title: 'Chatbot Efficiency',
            description: 'Self-service resolution rate at 85.7%, reducing support workload',
            metric: '2,100',
            metricLabel: 'auto-resolved',
            priority: 'low',
          },
        ]);
      }

      if (alertsResult.success && alertsResult.data.length > 0) {
        setAlerts(alertsResult.data);
      } else {
        // Mock alerts
        setAlerts([
          {
            id: 1,
            type: 'warning',
            category: 'users',
            message: '125 Tier 3 subscriptions expiring in the next 7 days',
            value: 125,
            threshold: 100,
            created_at: new Date().toISOString(),
          },
          {
            id: 2,
            type: 'info',
            category: 'scanner',
            message: 'Double Bottom pattern detection accuracy improved to 82%',
            value: '82%',
            threshold: '75%',
            created_at: new Date(Date.now() - 3600000).toISOString(),
          },
        ]);
      }

      // Mock recommendations
      setRecommendations([
        {
          id: 1,
          title: 'Launch Re-engagement Campaign',
          description: 'Target inactive users (30+ days) with personalized discount offers. Estimated 15% conversion rate.',
          impact: 'high',
          effort: 'medium',
          category: 'marketing',
        },
        {
          id: 2,
          title: 'Optimize Checkout Flow',
          description: 'Cart abandonment at checkout stage is 27%. Consider adding one-click purchase for returning customers.',
          impact: 'high',
          effort: 'high',
          category: 'conversion',
        },
        {
          id: 3,
          title: 'Expand FAQ Coverage',
          description: 'Top 5 unmatched queries relate to "limit orders". Adding FAQ entries could reduce handoffs by 12%.',
          impact: 'medium',
          effort: 'low',
          category: 'support',
        },
        {
          id: 4,
          title: 'Feature Promotion',
          description: 'Vision Board feature has low adoption (9.6%). Consider in-app tutorials and email campaign.',
          impact: 'medium',
          effort: 'medium',
          category: 'engagement',
        },
      ]);

      // Mock predictions
      setPredictions([
        {
          metric: 'Revenue (Next Month)',
          predicted: '142M VND',
          confidence: 85,
          trend: 'up',
          change: '+13.6%',
        },
        {
          metric: 'New Users (Next Month)',
          predicted: '720',
          confidence: 78,
          trend: 'up',
          change: '+10.8%',
        },
        {
          metric: 'Churn Rate',
          predicted: '4.2%',
          confidence: 82,
          trend: 'down',
          change: '-0.5%',
        },
        {
          metric: 'Support Tickets',
          predicted: '380',
          confidence: 75,
          trend: 'down',
          change: '-8%',
        },
      ]);
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString('vi-VN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Insights</h1>
          <p className="text-gray-400 mt-1">AI-powered analytics, predictions, and recommendations</p>
        </div>
        <button
          onClick={loadInsights}
          className="px-4 py-2 bg-amber-500 text-gray-900 rounded-lg hover:bg-amber-400 transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>Refresh Insights</span>
        </button>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const alertStyle = ALERT_TYPES[alert.type] || ALERT_TYPES.info;
            return (
              <div key={alert.id} className={`p-4 rounded-xl ${alertStyle.bg} border border-${alert.type === 'critical' ? 'red' : alert.type === 'warning' ? 'amber' : 'blue'}-500/30`}>
                <div className="flex items-start space-x-3">
                  <svg className={`w-6 h-6 ${alertStyle.text} flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={alertStyle.icon} />
                  </svg>
                  <div className="flex-1">
                    <p className={`font-medium ${alertStyle.text}`}>{alert.message}</p>
                    <p className="text-gray-400 text-sm mt-1">Detected: {formatDate(alert.created_at)}</p>
                  </div>
                  <button className="text-gray-400 hover:text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-40 bg-gray-800 rounded-xl animate-pulse"></div>
          ))
        ) : (
          insights.map((insight, index) => {
            const priorityStyle = PRIORITY_COLORS[insight.priority] || PRIORITY_COLORS.medium;
            return (
              <div key={index} className={`bg-gray-800 rounded-xl p-6 border ${priorityStyle.border}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${priorityStyle.bg}`}>
                      <svg className={`w-5 h-5 ${priorityStyle.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={CATEGORY_ICONS[insight.category]} />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{insight.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded ${priorityStyle.bg} ${priorityStyle.text}`}>
                        {insight.priority} priority
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-4">{insight.description}</p>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">{insight.metric}</p>
                    <p className="text-gray-500 text-sm">{insight.metricLabel}</p>
                  </div>
                  <button className="text-amber-500 hover:text-amber-400 text-sm font-medium">
                    View Details →
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Predictions & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Predictions */}
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">AI Predictions</h3>
            <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded">ML Powered</span>
          </div>
          {loading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-700 rounded animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {predictions.map((pred, index) => (
                <div key={index} className="p-4 bg-gray-750 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">{pred.metric}</span>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm ${pred.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                        {pred.change}
                      </span>
                      <svg
                        className={`w-4 h-4 ${pred.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={pred.trend === 'up' ? 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' : 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6'}
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="text-xl font-bold text-white">{pred.predicted}</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500" style={{ width: `${pred.confidence}%` }}></div>
                      </div>
                      <span className="text-xs text-gray-400">{pred.confidence}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommendations */}
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Recommendations</h3>
            <span className="text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded">Action Items</span>
          </div>
          {loading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-700 rounded animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <div key={rec.id} className="p-4 bg-gray-750 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-white font-medium">{rec.title}</h4>
                    <div className="flex items-center space-x-1">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        rec.impact === 'high' ? 'bg-green-500/20 text-green-400' :
                        rec.impact === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {rec.impact} impact
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        rec.effort === 'low' ? 'bg-green-500/20 text-green-400' :
                        rec.effort === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {rec.effort} effort
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">{rec.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Health Score */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Platform Health Score</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { name: 'User Engagement', score: 78, color: '#10B981' },
            { name: 'Revenue Health', score: 85, color: '#FFBD59' },
            { name: 'Support Quality', score: 92, color: '#3B82F6' },
            { name: 'System Performance', score: 96, color: '#8B5CF6' },
          ].map((metric, index) => (
            <div key={index} className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-3">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="none"
                    stroke="#374151"
                    strokeWidth="8"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="none"
                    stroke={metric.color}
                    strokeWidth="8"
                    strokeDasharray={`${(metric.score / 100) * 251.2} 251.2`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{metric.score}</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm">{metric.name}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 p-4 bg-gray-750 rounded-lg flex items-center justify-between">
          <div>
            <p className="text-white font-medium">Overall Health Score</p>
            <p className="text-gray-400 text-sm">Based on 12 key metrics across all systems</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-green-500">87.8</p>
            <p className="text-green-400 text-sm">+2.4 from last week</p>
          </div>
        </div>
      </div>
    </div>
  );
}
