/**
 * Agent Management Page
 * Manage support agents and their assignments
 */

import React, { useState, useEffect } from 'react';
import DataTable from '../../components/DataTable';
import api from '../../services/api';

const statusColors = {
  online: 'bg-green-500',
  offline: 'bg-gray-500',
  busy: 'bg-yellow-500',
};

export default function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    max_concurrent_chats: 5,
  });

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    setLoading(true);
    try {
      const response = await api.getAgents();
      setAgents(response.agents || []);
    } catch (error) {
      console.error('Error loading agents:', error);
      // Mock data
      setAgents([
        {
          id: '1',
          name: 'Nguyen Support',
          email: 'support1@gemral.com',
          status: 'online',
          current_chats: 2,
          max_concurrent_chats: 5,
          total_handled: 150,
          avg_response_time: 45,
          avg_resolution_time: 300,
          avg_csat: 4.5,
          created_at: '2024-11-01T00:00:00Z',
          last_active: '2024-12-27T14:30:00Z',
        },
        {
          id: '2',
          name: 'Tran Support',
          email: 'support2@gemral.com',
          status: 'online',
          current_chats: 4,
          max_concurrent_chats: 5,
          total_handled: 230,
          avg_response_time: 38,
          avg_resolution_time: 250,
          avg_csat: 4.7,
          created_at: '2024-10-15T00:00:00Z',
          last_active: '2024-12-27T14:25:00Z',
        },
        {
          id: '3',
          name: 'Le Support',
          email: 'support3@gemral.com',
          status: 'offline',
          current_chats: 0,
          max_concurrent_chats: 5,
          total_handled: 89,
          avg_response_time: 52,
          avg_resolution_time: 320,
          avg_csat: 4.2,
          created_at: '2024-12-01T00:00:00Z',
          last_active: '2024-12-26T18:00:00Z',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAgent = () => {
    setEditingAgent(null);
    setFormData({
      name: '',
      email: '',
      max_concurrent_chats: 5,
    });
    setShowEditor(true);
  };

  const handleEditAgent = (agent) => {
    setEditingAgent(agent);
    setFormData({
      name: agent.name,
      email: agent.email,
      max_concurrent_chats: agent.max_concurrent_chats,
    });
    setShowEditor(true);
  };

  const handleSaveAgent = async (e) => {
    e.preventDefault();
    try {
      if (editingAgent) {
        await api.updateAgent(editingAgent.id, formData);
      } else {
        await api.createAgent(formData);
      }
      setShowEditor(false);
      loadAgents();
    } catch (error) {
      console.error('Error saving agent:', error);
      alert('Error saving agent');
    }
  };

  const handleDeleteAgent = async (agentId) => {
    if (!confirm('Are you sure you want to delete this agent?')) return;

    try {
      await api.deleteAgent(agentId);
      loadAgents();
    } catch (error) {
      console.error('Error deleting agent:', error);
      alert('Error deleting agent');
    }
  };

  const handleToggleStatus = async (agent) => {
    const newStatus = agent.status === 'online' ? 'offline' : 'online';
    try {
      await api.updateAgentStatus(agent.id, newStatus);
      setAgents((prev) =>
        prev.map((a) => (a.id === agent.id ? { ...a, status: newStatus } : a))
      );
    } catch (error) {
      console.error('Error updating agent status:', error);
    }
  };

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const columns = [
    {
      key: 'name',
      title: 'Agent',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-medium">
              {value?.charAt(0).toUpperCase()}
            </div>
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-800 ${
                statusColors[row.status]
              }`}
            ></span>
          </div>
          <div>
            <div className="font-medium text-white">{value}</div>
            <div className="text-sm text-gray-400">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (value, row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleStatus(row);
          }}
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            statusColors[value]
          }/20 text-${statusColors[value]?.replace('bg-', '')}`}
        >
          <span className={`w-2 h-2 rounded-full ${statusColors[value]} mr-2`}></span>
          {value?.charAt(0).toUpperCase() + value?.slice(1)}
        </button>
      ),
    },
    {
      key: 'current_chats',
      title: 'Active Chats',
      render: (value, row) => (
        <div className="flex items-center space-x-2">
          <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                value / row.max_concurrent_chats >= 0.8
                  ? 'bg-red-500'
                  : value / row.max_concurrent_chats >= 0.5
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${(value / row.max_concurrent_chats) * 100}%` }}
            ></div>
          </div>
          <span className="text-sm text-gray-400">
            {value}/{row.max_concurrent_chats}
          </span>
        </div>
      ),
    },
    {
      key: 'total_handled',
      title: 'Total Handled',
      sortable: true,
      render: (value) => <span className="text-gray-300">{value?.toLocaleString() || 0}</span>,
    },
    {
      key: 'avg_response_time',
      title: 'Avg Response',
      sortable: true,
      render: (value) => <span className="text-gray-300">{formatTime(value || 0)}</span>,
    },
    {
      key: 'avg_csat',
      title: 'CSAT',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-1">
          <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-white font-medium">{value?.toFixed(1) || '0.0'}</span>
        </div>
      ),
    },
    {
      key: 'last_active',
      title: 'Last Active',
      render: (value) => {
        if (!value) return <span className="text-gray-500">Never</span>;
        const date = new Date(value);
        const now = new Date();
        const diff = Math.floor((now - date) / 60000); // minutes
        if (diff < 5) return <span className="text-green-500">Just now</span>;
        if (diff < 60) return <span className="text-gray-400">{diff}m ago</span>;
        if (diff < 1440) return <span className="text-gray-400">{Math.floor(diff / 60)}h ago</span>;
        return (
          <span className="text-gray-500">
            {date.toLocaleDateString('vi-VN')}
          </span>
        );
      },
    },
    {
      key: 'actions',
      title: '',
      render: (_, row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEditAgent(row);
            }}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteAgent(row.id);
            }}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  // Calculate summary stats
  const onlineAgents = agents.filter((a) => a.status === 'online').length;
  const totalCapacity = agents.reduce((sum, a) => sum + (a.status === 'online' ? a.max_concurrent_chats : 0), 0);
  const currentLoad = agents.reduce((sum, a) => sum + (a.status === 'online' ? a.current_chats : 0), 0);
  const avgCSAT = agents.length > 0 ? (agents.reduce((sum, a) => sum + (a.avg_csat || 0), 0) / agents.length).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Agent Management</h1>
          <p className="text-gray-400 mt-1">Manage support agents and their workload</p>
        </div>
        <button
          onClick={handleCreateAgent}
          className="px-4 py-2 bg-amber-500 text-gray-900 rounded-lg hover:bg-amber-400 transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Agent</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">{agents.length}</div>
              <div className="text-sm text-gray-400">Total Agents</div>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-500">{onlineAgents}</div>
              <div className="text-sm text-gray-400">Online Now</div>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-amber-500">
                {currentLoad}/{totalCapacity}
              </div>
              <div className="text-sm text-gray-400">Current Load</div>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-lg">
              <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-1">
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-2xl font-bold text-white">{avgCSAT}</span>
              </div>
              <div className="text-sm text-gray-400">Avg CSAT Score</div>
            </div>
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={agents}
        loading={loading}
        onRowClick={(row) => handleEditAgent(row)}
        emptyMessage="No agents found"
      />

      {/* Agent Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                {editingAgent ? 'Edit Agent' : 'Add Agent'}
              </h2>
              <button
                onClick={() => setShowEditor(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSaveAgent} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Concurrent Chats
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.max_concurrent_chats}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      max_concurrent_chats: parseInt(e.target.value) || 5,
                    }))
                  }
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditor(false)}
                  className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-gray-900 rounded-lg hover:bg-amber-400 transition-colors"
                >
                  {editingAgent ? 'Save Changes' : 'Add Agent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
