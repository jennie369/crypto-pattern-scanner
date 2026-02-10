/**
 * Courses Management Page
 * Manage courses, modules, lessons, and quizzes
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import StatsCard from '../../components/StatsCard';
import DataTable from '../../components/DataTable';
import ConfirmModal from '../../components/common/ConfirmModal';
import StatusBadge from '../../components/common/StatusBadge';
import ImageUploader from '../../components/media/ImageUploader';
import * as courseService from '../../services/courseService';

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-gray-500/20 text-gray-400' },
  published: { label: 'Published', color: 'bg-green-500/20 text-green-400' },
  archived: { label: 'Archived', color: 'bg-red-500/20 text-red-400' },
};

const TIER_CONFIG = {
  free: { label: 'Free', color: 'bg-gray-500/20 text-gray-400' },
  tier_1: { label: 'Tier 1', color: 'bg-blue-500/20 text-blue-400' },
  tier_2: { label: 'Tier 2', color: 'bg-purple-500/20 text-purple-400' },
  tier_3: { label: 'Tier 3', color: 'bg-amber-500/20 text-amber-500' },
};

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: 'all' });
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [showEditor, setShowEditor] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, course: null });
  const [formData, setFormData] = useState({});

  const loadCourses = useCallback(async () => {
    setLoading(true);
    try {
      const result = await courseService.getCourses({
        status: filter.status,
        search,
        page: pagination.page,
        limit: 20,
      });

      if (result.success) {
        setCourses(result.data);
        setPagination(prev => ({
          ...prev,
          total: result.total,
          totalPages: result.totalPages,
        }));
      }
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  }, [filter, search, pagination.page]);

  const loadStats = useCallback(async () => {
    const result = await courseService.getCourseStats();
    if (result.success) {
      setStats(result.data);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleCreate = () => {
    setEditingCourse(null);
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      thumbnail_url: '',
      tier_required: 'free',
      price: '',
      status: 'draft',
      difficulty_level: 'beginner',
    });
    setShowEditor(true);
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({ ...course });
    setShowEditor(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = editingCourse
        ? await courseService.updateCourse(editingCourse.id, formData)
        : await courseService.createCourse(formData);

      if (result.success) {
        setShowEditor(false);
        loadCourses();
        loadStats();
      } else {
        alert(result.error || 'Failed to save course');
      }
    } catch (error) {
      console.error('Error saving course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.course) return;

    setLoading(true);
    try {
      const result = await courseService.deleteCourse(deleteModal.course.id);
      if (result.success) {
        setDeleteModal({ open: false, course: null });
        loadCourses();
        loadStats();
      }
    } catch (error) {
      console.error('Error deleting course:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'thumbnail_url',
      title: '',
      render: (value) => (
        <div className="w-20 h-12 bg-gray-700 rounded overflow-hidden">
          {value && <img src={value} alt="" className="w-full h-full object-cover" />}
        </div>
      ),
    },
    {
      key: 'title',
      title: 'Course',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-white">{value}</div>
          {row.subtitle && <div className="text-sm text-gray-400">{row.subtitle}</div>}
        </div>
      ),
    },
    {
      key: 'tier_required',
      title: 'Tier',
      render: (value) => {
        const config = TIER_CONFIG[value] || TIER_CONFIG.free;
        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${config.color}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => {
        const config = STATUS_CONFIG[value] || STATUS_CONFIG.draft;
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      key: 'difficulty_level',
      title: 'Level',
      render: (value) => (
        <span className="text-gray-400 capitalize">{value || 'Beginner'}</span>
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
              router.push(`/courses/${row.id}/modules`);
            }}
            className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
            title="Edit Modules"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/courses/${row.id}/students`);
            }}
            className="p-1 text-gray-400 hover:text-green-400 transition-colors"
            title="View Students"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row);
            }}
            className="p-1 text-gray-400 hover:text-white transition-colors"
            title="Edit"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteModal({ open: true, course: row });
            }}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            title="Delete"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
          <h1 className="text-2xl font-bold text-white">Courses</h1>
          <p className="text-gray-400 mt-1">Manage courses, modules, and lessons</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-amber-500 text-gray-900 rounded-lg hover:bg-amber-400 transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Create Course</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total Courses"
          value={stats?.total || 0}
          icon="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          loading={!stats}
        />
        <StatsCard
          title="Published"
          value={stats?.published || 0}
          changeType="positive"
          icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          loading={!stats}
        />
        <StatsCard
          title="Draft"
          value={stats?.draft || 0}
          icon="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          loading={!stats}
        />
        <StatsCard
          title="Total Enrollments"
          value={stats?.totalEnrollments?.toLocaleString() || 0}
          icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          loading={!stats}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-gray-800 rounded-xl">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <select
          value={filter.status}
          onChange={(e) => {
            setFilter(prev => ({ ...prev, status: e.target.value }));
            setPagination(prev => ({ ...prev, page: 1 }));
          }}
          className="bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>

        <button
          onClick={loadCourses}
          className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={courses}
        loading={loading}
        onRowClick={handleEdit}
        emptyMessage="No courses found. Create your first course!"
        pagination={{
          page: pagination.page,
          totalPages: pagination.totalPages,
          total: pagination.total,
          from: (pagination.page - 1) * 20 + 1,
          to: Math.min(pagination.page * 20, pagination.total),
        }}
        onPageChange={(newPage) => setPagination(prev => ({ ...prev, page: newPage }))}
      />

      {/* Course Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between sticky top-0 bg-gray-800 z-10">
              <h2 className="text-xl font-semibold text-white">
                {editingCourse ? 'Edit Course' : 'Create Course'}
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

            <form onSubmit={handleSave} className="p-6 space-y-6">
              <ImageUploader
                label="Thumbnail"
                value={formData.thumbnail_url}
                onChange={(url) => setFormData(prev => ({ ...prev, thumbnail_url: url }))}
                aspectRatio="16/9"
              />

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Course title..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Subtitle</label>
                <input
                  type="text"
                  value={formData.subtitle || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Course subtitle..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  placeholder="Course description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tier Required</label>
                  <select
                    value={formData.tier_required || 'free'}
                    onChange={(e) => setFormData(prev => ({ ...prev, tier_required: e.target.value }))}
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="free">Free</option>
                    <option value="tier_1">Tier 1</option>
                    <option value="tier_2">Tier 2</option>
                    <option value="tier_3">Tier 3</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
                  <select
                    value={formData.difficulty_level || 'beginner'}
                    onChange={(e) => setFormData(prev => ({ ...prev, difficulty_level: e.target.value }))}
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Price (VND)</label>
                  <input
                    type="number"
                    value={formData.price || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="0 for free"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                  <select
                    value={formData.status || 'draft'}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowEditor(false)}
                  className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-amber-500 text-gray-900 rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-50"
                >
                  {editingCourse ? 'Save Changes' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, course: null })}
        onConfirm={handleDelete}
        title="Delete Course"
        message={`Are you sure you want to delete "${deleteModal.course?.title}"? This will also delete all modules and lessons.`}
        confirmText="Delete"
        variant="danger"
        loading={loading}
      />
    </div>
  );
}
