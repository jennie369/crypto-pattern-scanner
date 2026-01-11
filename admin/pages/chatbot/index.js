/**
 * Conversations Page
 * List and manage all chatbot conversations
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DataTable from '../../components/DataTable';
import api from '../../services/api';

const platformColors = {
  zalo: 'bg-blue-500',
  messenger: 'bg-indigo-500',
  web: 'bg-amber-500',
};

const statusColors = {
  active: 'bg-green-500',
  waiting: 'bg-yellow-500',
  handoff: 'bg-red-500',
  resolved: 'bg-gray-500',
};

export default function ConversationsPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    platform: 'all',
    status: 'all',
    search: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });

  useEffect(() => {
    loadConversations();
  }, [filter, pagination.page]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (filter.platform !== 'all') params.platform = filter.platform;
      if (filter.status !== 'all') params.status = filter.status;
      if (filter.search) params.search = filter.search;

      const response = await api.getConversations(params);
      setConversations(response.conversations || []);
      setPagination((prev) => ({
        ...prev,
        total: response.total || 0,
      }));
    } catch (error) {
      console.error('Error loading conversations:', error);
      // Mock data for demo
      setConversations([
        {
          id: '1',
          platform: 'zalo',
          user_name: 'Nguyen Van A',
          phone: '0901234567',
          last_message: 'Cam on ban da ho tro',
          message_count: 15,
          status: 'active',
          emotion: 'happy',
          created_at: '2024-12-27T10:30:00Z',
          updated_at: '2024-12-27T14:30:00Z',
        },
        {
          id: '2',
          platform: 'messenger',
          user_name: 'Tran Thi B',
          phone: null,
          last_message: 'Don hang cua em sao roi?',
          message_count: 8,
          status: 'waiting',
          emotion: 'anxious',
          created_at: '2024-12-27T09:00:00Z',
          updated_at: '2024-12-27T14:00:00Z',
        },
        {
          id: '3',
          platform: 'web',
          user_name: 'Guest User',
          phone: null,
          last_message: 'Hello',
          message_count: 3,
          status: 'active',
          emotion: 'neutral',
          created_at: '2024-12-27T13:00:00Z',
          updated_at: '2024-12-27T13:30:00Z',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'platform',
      title: 'Platform',
      render: (value) => (
        <span
          className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-medium ${
            platformColors[value] || 'bg-gray-500'
          }`}
        >
          {value?.charAt(0).toUpperCase()}
        </span>
      ),
    },
    {
      key: 'user_name',
      title: 'User',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-white">{value}</div>
          {row.phone && <div className="text-sm text-gray-400">{row.phone}</div>}
        </div>
      ),
    },
    {
      key: 'last_message',
      title: 'Last Message',
      render: (value) => (
        <div className="max-w-xs truncate text-gray-300">{value}</div>
      ),
    },
    {
      key: 'message_count',
      title: 'Messages',
      sortable: true,
      render: (value) => (
        <span className="text-gray-300">{value}</span>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            statusColors[value]
          }/20 text-${statusColors[value]?.replace('bg-', '')}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${statusColors[value]} mr-1.5`}></span>
          {value?.charAt(0).toUpperCase() + value?.slice(1)}
        </span>
      ),
    },
    {
      key: 'updated_at',
      title: 'Last Activity',
      sortable: true,
      render: (value) => {
        const date = new Date(value);
        return (
          <span className="text-gray-400 text-sm">
            {date.toLocaleDateString('vi-VN')} {date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Conversations</h1>
          <p className="text-gray-400 mt-1">View and manage all chatbot conversations</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-gray-800 rounded-xl">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search by name or message..."
            value={filter.search}
            onChange={(e) => setFilter((prev) => ({ ...prev, search: e.target.value }))}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Platform Filter */}
        <select
          value={filter.platform}
          onChange={(e) => setFilter((prev) => ({ ...prev, platform: e.target.value }))}
          className="bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="all">All Platforms</option>
          <option value="zalo">Zalo</option>
          <option value="messenger">Messenger</option>
          <option value="web">Web</option>
        </select>

        {/* Status Filter */}
        <select
          value={filter.status}
          onChange={(e) => setFilter((prev) => ({ ...prev, status: e.target.value }))}
          className="bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="waiting">Waiting</option>
          <option value="handoff">Handoff</option>
          <option value="resolved">Resolved</option>
        </select>

        {/* Refresh */}
        <button
          onClick={loadConversations}
          className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={conversations}
        loading={loading}
        onRowClick={(row) => router.push(`/chatbot/${row.id}`)}
        pagination={{
          page: pagination.page,
          totalPages: Math.ceil(pagination.total / pagination.limit),
          from: (pagination.page - 1) * pagination.limit + 1,
          to: Math.min(pagination.page * pagination.limit, pagination.total),
          total: pagination.total,
        }}
        onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
        emptyMessage="No conversations found"
      />
    </div>
  );
}
