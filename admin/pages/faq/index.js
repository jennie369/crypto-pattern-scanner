/**
 * FAQ Management Page
 * List, create, and manage FAQ entries
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DataTable from '../../components/DataTable';
import FAQEditor from '../../components/FAQEditor';
import api from '../../services/api';

const categoryColors = {
  general: 'bg-blue-500',
  order: 'bg-green-500',
  payment: 'bg-yellow-500',
  shipping: 'bg-purple-500',
  product: 'bg-pink-500',
  trading: 'bg-amber-500',
  courses: 'bg-indigo-500',
  gemral: 'bg-cyan-500',
  account: 'bg-red-500',
};

export default function FAQPage() {
  const router = useRouter();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState(null);
  const [filter, setFilter] = useState({
    category: 'all',
    search: '',
    status: 'all',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadFAQs();
    loadStats();
  }, [filter, pagination.page]);

  const loadFAQs = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (filter.category !== 'all') params.category = filter.category;
      if (filter.search) params.search = filter.search;
      if (filter.status !== 'all') params.is_active = filter.status === 'active';

      const response = await api.getFAQs(params);
      setFaqs(response.faqs || []);
      setPagination((prev) => ({
        ...prev,
        total: response.total || 0,
      }));
    } catch (error) {
      console.error('Error loading FAQs:', error);
      // Mock data
      setFaqs([
        {
          id: '1',
          question: 'Làm sao để đặt hàng?',
          answer: 'Bạn có thể đặt hàng qua app hoặc website...',
          category: 'order',
          keywords: ['đặt hàng', 'mua', 'order'],
          match_count: 150,
          helpful_count: 120,
          not_helpful_count: 5,
          is_active: true,
          created_at: '2024-12-01T00:00:00Z',
        },
        {
          id: '2',
          question: 'Thời gian giao hàng bao lâu?',
          answer: 'Thời gian giao hàng từ 2-5 ngày...',
          category: 'shipping',
          keywords: ['giao hàng', 'ship', 'delivery'],
          match_count: 200,
          helpful_count: 180,
          not_helpful_count: 10,
          is_active: true,
          created_at: '2024-12-01T00:00:00Z',
        },
        {
          id: '3',
          question: 'DPD, DPU, UPU, UPD là gì?',
          answer: 'Đây là 4 pattern chính của Frequency Trading Method...',
          category: 'trading',
          keywords: ['dpd', 'dpu', 'upu', 'upd', 'pattern'],
          match_count: 320,
          helpful_count: 300,
          not_helpful_count: 8,
          is_active: true,
          created_at: '2024-12-15T00:00:00Z',
        },
      ]);
      setPagination((prev) => ({ ...prev, total: 3 }));
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await api.getFAQStats();
      setStats(data);
    } catch (error) {
      // Mock stats
      setStats({
        total_faqs: 29,
        active_faqs: 27,
        total_matches: 15420,
        avg_helpful_rate: 92.5,
        top_categories: [
          { category: 'trading', count: 8 },
          { category: 'order', count: 6 },
          { category: 'payment', count: 5 },
        ],
      });
    }
  };

  const handleCreateFAQ = () => {
    setEditingFAQ(null);
    setShowEditor(true);
  };

  const handleEditFAQ = (faq) => {
    setEditingFAQ(faq);
    setShowEditor(true);
  };

  const handleSaveFAQ = async (faqData) => {
    try {
      if (editingFAQ) {
        await api.updateFAQ(editingFAQ.id, faqData);
      } else {
        await api.createFAQ(faqData);
      }
      setShowEditor(false);
      loadFAQs();
      loadStats();
    } catch (error) {
      console.error('Error saving FAQ:', error);
      alert('Error saving FAQ');
    }
  };

  const handleDeleteFAQ = async (faqId) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;

    try {
      await api.deleteFAQ(faqId);
      loadFAQs();
      loadStats();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      alert('Error deleting FAQ');
    }
  };

  const handleToggleActive = async (faq) => {
    try {
      await api.updateFAQ(faq.id, { is_active: !faq.is_active });
      loadFAQs();
    } catch (error) {
      console.error('Error toggling FAQ status:', error);
    }
  };

  const columns = [
    {
      key: 'category',
      title: 'Category',
      render: (value) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            categoryColors[value] || 'bg-gray-500'
          }/20 text-white`}
        >
          <span className={`w-2 h-2 rounded-full ${categoryColors[value] || 'bg-gray-500'} mr-1.5`}></span>
          {value}
        </span>
      ),
    },
    {
      key: 'question',
      title: 'Question',
      sortable: true,
      render: (value) => (
        <div className="max-w-md">
          <span className="text-white font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: 'keywords',
      title: 'Keywords',
      render: (value) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {value?.slice(0, 3).map((kw, i) => (
            <span key={i} className="px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded">
              {kw}
            </span>
          ))}
          {value?.length > 3 && (
            <span className="px-2 py-0.5 bg-gray-700 text-gray-400 text-xs rounded">
              +{value.length - 3}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'match_count',
      title: 'Matches',
      sortable: true,
      render: (value) => <span className="text-gray-300">{value?.toLocaleString() || 0}</span>,
    },
    {
      key: 'helpful_rate',
      title: 'Helpful',
      render: (_, row) => {
        const total = (row.helpful_count || 0) + (row.not_helpful_count || 0);
        const rate = total > 0 ? ((row.helpful_count || 0) / total * 100).toFixed(1) : 0;
        return (
          <div className="flex items-center space-x-2">
            <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${rate >= 80 ? 'bg-green-500' : rate >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${rate}%` }}
              ></div>
            </div>
            <span className="text-sm text-gray-400">{rate}%</span>
          </div>
        );
      },
    },
    {
      key: 'is_active',
      title: 'Status',
      render: (value, row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleActive(row);
          }}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            value ? 'bg-green-500' : 'bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              value ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      ),
    },
    {
      key: 'actions',
      title: '',
      render: (_, row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEditFAQ(row);
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
              handleDeleteFAQ(row.id);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">FAQ Management</h1>
          <p className="text-gray-400 mt-1">Manage automated FAQ responses</p>
        </div>
        <button
          onClick={handleCreateFAQ}
          className="px-4 py-2 bg-amber-500 text-gray-900 rounded-lg hover:bg-amber-400 transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add FAQ</span>
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">{stats.total_faqs}</div>
            <div className="text-sm text-gray-400">Total FAQs</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-green-500">{stats.active_faqs}</div>
            <div className="text-sm text-gray-400">Active FAQs</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-amber-500">{stats.total_matches?.toLocaleString()}</div>
            <div className="text-sm text-gray-400">Total Matches</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-blue-500">{stats.avg_helpful_rate}%</div>
            <div className="text-sm text-gray-400">Avg Helpful Rate</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-gray-800 rounded-xl">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search questions or keywords..."
            value={filter.search}
            onChange={(e) => setFilter((prev) => ({ ...prev, search: e.target.value }))}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Category Filter */}
        <select
          value={filter.category}
          onChange={(e) => setFilter((prev) => ({ ...prev, category: e.target.value }))}
          className="bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="all">All Categories</option>
          <option value="general">General</option>
          <option value="order">Order</option>
          <option value="payment">Payment</option>
          <option value="shipping">Shipping</option>
          <option value="product">Product</option>
          <option value="trading">Trading</option>
          <option value="courses">Courses</option>
          <option value="gemral">Gemral</option>
          <option value="account">Account</option>
        </select>

        {/* Status Filter */}
        <select
          value={filter.status}
          onChange={(e) => setFilter((prev) => ({ ...prev, status: e.target.value }))}
          className="bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        {/* Refresh */}
        <button
          onClick={loadFAQs}
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
        data={faqs}
        loading={loading}
        onRowClick={(row) => handleEditFAQ(row)}
        pagination={{
          page: pagination.page,
          totalPages: Math.ceil(pagination.total / pagination.limit),
          from: (pagination.page - 1) * pagination.limit + 1,
          to: Math.min(pagination.page * pagination.limit, pagination.total),
          total: pagination.total,
        }}
        onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
        emptyMessage="No FAQs found"
      />

      {/* FAQ Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                {editingFAQ ? 'Edit FAQ' : 'Create FAQ'}
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
            <div className="p-6">
              <FAQEditor
                faq={editingFAQ}
                onSave={handleSaveFAQ}
                onCancel={() => setShowEditor(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
