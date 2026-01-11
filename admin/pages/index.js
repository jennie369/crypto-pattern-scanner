/**
 * Dashboard Page
 * Main overview with key metrics
 */

import React, { useState, useEffect } from 'react';
import StatsCard from '../components/StatsCard';
import ChatMonitor from '../components/ChatMonitor';
import HandoffQueue from '../components/HandoffQueue';
import api from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [handoffQueue, setHandoffQueue] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    // Refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load stats
      const [analyticsRes, cartRes, gamificationRes] = await Promise.all([
        api.getConversationStats(7).catch(() => ({})),
        api.getCartRecoveryStats(7).catch(() => ({})),
        api.getGamificationStats(7).catch(() => ({})),
      ]);

      setStats({
        totalConversations: analyticsRes.total_conversations || 0,
        activeUsers: analyticsRes.active_users || 0,
        faqAutomation: analyticsRes.faq_automation_rate || 0,
        avgResponseTime: analyticsRes.avg_response_time || 0,
        cartRecoveryRate: cartRes.recovery_rate || 0,
        totalRecovered: cartRes.total_recovered || 0,
        gamificationEngagement: gamificationRes.engagement_rate || 0,
        totalGems: gamificationRes.total_gems_earned || 0,
      });

      // Load conversations (mock data for now)
      setConversations([
        {
          id: '1',
          platform: 'zalo',
          user_name: 'Nguyen Van A',
          last_message: 'Cho em hoi ve san pham nay',
          time_ago: '2 min ago',
          emotion: 'neutral',
          status: 'active',
          unread: 2,
        },
        {
          id: '2',
          platform: 'messenger',
          user_name: 'Tran Thi B',
          last_message: 'Don hang cua em den chua?',
          time_ago: '5 min ago',
          emotion: 'anxious',
          status: 'waiting',
          unread: 0,
        },
        {
          id: '3',
          platform: 'web',
          user_name: 'Web User',
          last_message: 'Lam sao de dang ky tai khoan?',
          time_ago: '10 min ago',
          emotion: 'neutral',
          status: 'active',
          unread: 1,
        },
      ]);

      // Load handoff queue (mock data)
      setHandoffQueue([
        {
          id: '1',
          user_name: 'Le Van C',
          platform: 'zalo',
          reason: 'user_request',
          priority: 2,
          position: 1,
          wait_time: '5 min',
          summary: 'Khach hang muon gap nhan vien de hoi ve chinh sach doi tra',
          status: 'waiting',
        },
      ]);

      // Load agents
      setAgents([
        { id: '1', name: 'Agent 1', status: 'online', current_chats: 2, max_concurrent_chats: 5 },
        { id: '2', name: 'Agent 2', status: 'online', current_chats: 4, max_concurrent_chats: 5 },
        { id: '3', name: 'Agent 3', status: 'offline', current_chats: 0, max_concurrent_chats: 5 },
      ]);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignHandoff = async (handoffId, agentId) => {
    try {
      await api.assignHandoff(handoffId, agentId);
      loadDashboardData();
    } catch (error) {
      console.error('Error assigning handoff:', error);
    }
  };

  const handleResolveHandoff = async (handoffId, notes) => {
    try {
      await api.resolveHandoff(handoffId, notes);
      loadDashboardData();
    } catch (error) {
      console.error('Error resolving handoff:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Overview of your chatbot performance</p>
        </div>
        <button
          onClick={loadDashboardData}
          className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Conversations"
          value={stats?.totalConversations?.toLocaleString() || '0'}
          change="+12% from last week"
          changeType="positive"
          icon="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          loading={loading}
        />
        <StatsCard
          title="FAQ Automation"
          value={`${stats?.faqAutomation || 0}%`}
          change="Target: 70%"
          changeType={stats?.faqAutomation >= 70 ? 'positive' : 'neutral'}
          icon="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          loading={loading}
        />
        <StatsCard
          title="Cart Recovery"
          value={`${stats?.cartRecoveryRate || 0}%`}
          change={`${stats?.totalRecovered?.toLocaleString() || 0} VND recovered`}
          changeType="positive"
          icon="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          loading={loading}
        />
        <StatsCard
          title="Engagement"
          value={`${stats?.gamificationEngagement || 0}%`}
          change="Gamification active"
          changeType="positive"
          icon="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          loading={loading}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Monitor */}
        <div className="lg:col-span-2">
          <ChatMonitor
            conversations={conversations}
            onSelect={(conv) => console.log('Selected:', conv)}
          />
        </div>

        {/* Handoff Queue */}
        <div>
          <HandoffQueue
            queue={handoffQueue}
            agents={agents}
            onAssign={handleAssignHandoff}
            onResolve={handleResolveHandoff}
            loading={loading}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a
          href="/faq"
          className="p-4 bg-gray-800 rounded-xl hover:bg-gray-750 transition-colors flex items-center space-x-4"
        >
          <div className="p-3 bg-blue-500/10 rounded-lg">
            <svg
              className="w-6 h-6 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-white">Manage FAQs</h3>
            <p className="text-sm text-gray-400">Add or edit FAQ responses</p>
          </div>
        </a>

        <a
          href="/broadcasts"
          className="p-4 bg-gray-800 rounded-xl hover:bg-gray-750 transition-colors flex items-center space-x-4"
        >
          <div className="p-3 bg-purple-500/10 rounded-lg">
            <svg
              className="w-6 h-6 text-purple-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-white">Create Broadcast</h3>
            <p className="text-sm text-gray-400">Send messages to users</p>
          </div>
        </a>

        <a
          href="/analytics"
          className="p-4 bg-gray-800 rounded-xl hover:bg-gray-750 transition-colors flex items-center space-x-4"
        >
          <div className="p-3 bg-green-500/10 rounded-lg">
            <svg
              className="w-6 h-6 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-white">View Analytics</h3>
            <p className="text-sm text-gray-400">Detailed performance reports</p>
          </div>
        </a>
      </div>
    </div>
  );
}
