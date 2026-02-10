/**
 * Template Library Page
 * Manage reusable content templates for notifications
 */

import React, { useState, useEffect, useCallback } from 'react';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmModal from '../../components/common/ConfirmModal';
import ImageUploader from '../../components/media/ImageUploader';
import DeepLinkPicker from '../../components/media/DeepLinkPicker';
import * as contentService from '../../services/contentService';

const TEMPLATE_TYPES = [
  { value: 'push', label: 'Push Notification' },
  { value: 'email', label: 'Email' },
  { value: 'in_app', label: 'In-App Message' },
  { value: 'banner', label: 'Banner' },
];

const VARIABLE_SUGGESTIONS = [
  { key: '{{user_name}}', description: 'User\'s display name' },
  { key: '{{tier}}', description: 'User\'s subscription tier' },
  { key: '{{expiry_date}}', description: 'Subscription expiry date' },
  { key: '{{discount}}', description: 'Discount percentage' },
  { key: '{{product_name}}', description: 'Product name' },
  { key: '{{pattern}}', description: 'Pattern name' },
  { key: '{{symbol}}', description: 'Trading symbol' },
];

export default function TemplatesPage() {
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [selectedType, setSelectedType] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'push',
    title: '',
    body: '',
    image_url: '',
    deep_link: '',
    variables: [],
    is_active: true,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await contentService.getTemplates({ type: selectedType });

      if (result.success) {
        setTemplates(result.data);
      } else {
        // Mock data
        setTemplates([
          { id: 1, name: 'Pattern Alert', type: 'push', title: 'New Pattern: {{pattern}}', body: '{{pattern}} detected on {{symbol}}. Check the scanner now!', is_active: true, usage_count: 145 },
          { id: 2, name: 'Flash Sale', type: 'push', title: '{{discount}}% Off Today!', body: 'Limited time offer: Get {{discount}}% off on {{product_name}}!', is_active: true, usage_count: 82 },
          { id: 3, name: 'Subscription Expiring', type: 'push', title: 'Your subscription expires soon', body: 'Hi {{user_name}}, your {{tier}} subscription expires on {{expiry_date}}. Renew now to keep access!', is_active: true, usage_count: 234 },
          { id: 4, name: 'Welcome Message', type: 'push', title: 'Welcome to GEM!', body: 'Hi {{user_name}}, welcome to GEM Trading! Start exploring our features.', is_active: true, usage_count: 567 },
          { id: 5, name: 'Market Update', type: 'email', title: 'Weekly Market Analysis', body: 'Hi {{user_name}}, here\'s your weekly market analysis...', is_active: false, usage_count: 45 },
        ]);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedType]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      type: 'push',
      title: '',
      body: '',
      image_url: '',
      deep_link: '',
      variables: [],
      is_active: true,
    });
    setShowModal(true);
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name || '',
      type: template.type || 'push',
      title: template.title || '',
      body: template.body || '',
      image_url: template.image_url || '',
      deep_link: template.deep_link || '',
      variables: template.variables || [],
      is_active: template.is_active ?? true,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      // Extract variables from title and body
      const extractedVars = [];
      const varRegex = /\{\{(\w+)\}\}/g;
      let match;
      while ((match = varRegex.exec(formData.title + formData.body)) !== null) {
        if (!extractedVars.includes(match[1])) {
          extractedVars.push(match[1]);
        }
      }

      const dataToSave = {
        ...formData,
        variables: extractedVars,
      };

      if (editingTemplate) {
        await contentService.updateTemplate(editingTemplate.id, dataToSave);
      } else {
        await contentService.createTemplate(dataToSave);
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const handleToggleActive = async (template) => {
    try {
      await contentService.updateTemplate(template.id, { is_active: !template.is_active });
      loadData();
    } catch (error) {
      console.error('Error toggling template:', error);
    }
  };

  const handleDelete = (id) => {
    setDeletingId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await contentService.deleteTemplate(deletingId);
      setShowDeleteConfirm(false);
      loadData();
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const insertVariable = (variable) => {
    const textarea = document.getElementById('template-body');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newBody = formData.body.substring(0, start) + variable + formData.body.substring(end);
      setFormData({ ...formData, body: newBody });
    } else {
      setFormData({ ...formData, body: formData.body + variable });
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Template',
      render: (row) => (
        <div>
          <p className="text-white font-medium">{row.name}</p>
          <p className="text-gray-400 text-sm">{row.title}</p>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (row) => (
        <span className={`px-2 py-1 rounded text-xs ${
          row.type === 'push' ? 'bg-amber-500/20 text-amber-400' :
          row.type === 'email' ? 'bg-blue-500/20 text-blue-400' :
          row.type === 'in_app' ? 'bg-purple-500/20 text-purple-400' :
          'bg-green-500/20 text-green-400'
        }`}>
          {TEMPLATE_TYPES.find(t => t.value === row.type)?.label || row.type}
        </span>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (row) => (
        <StatusBadge
          status={row.is_active ? 'active' : 'inactive'}
          customLabel={row.is_active ? 'Active' : 'Inactive'}
        />
      ),
    },
    {
      key: 'usage_count',
      label: 'Uses',
      render: (row) => (
        <span className="text-gray-300">{row.usage_count?.toLocaleString() || 0}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleEdit(row)}
            className="px-3 py-1 bg-blue-500/20 text-blue-500 rounded hover:bg-blue-500/30 text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => handleToggleActive(row)}
            className={`px-3 py-1 rounded text-sm ${
              row.is_active
                ? 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                : 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
            }`}
          >
            {row.is_active ? 'Deactivate' : 'Activate'}
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="px-3 py-1 bg-red-500/20 text-red-500 rounded hover:bg-red-500/30 text-sm"
          >
            Delete
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
          <h1 className="text-2xl font-bold text-white">Template Library</h1>
          <p className="text-gray-400 mt-1">Manage reusable content templates</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-amber-500 text-gray-900 rounded-lg hover:bg-amber-400 transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Template</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-xl p-4 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{templates.length}</p>
            <p className="text-gray-400 text-sm">Total Templates</p>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{templates.filter(t => t.is_active).length}</p>
            <p className="text-gray-400 text-sm">Active</p>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{templates.filter(t => t.type === 'push').length}</p>
            <p className="text-gray-400 text-sm">Push Templates</p>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{templates.reduce((sum, t) => sum + (t.usage_count || 0), 0).toLocaleString()}</p>
            <p className="text-gray-400 text-sm">Total Uses</p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center space-x-4">
        <span className="text-gray-400">Filter:</span>
        <button
          onClick={() => setSelectedType('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            selectedType === 'all'
              ? 'bg-amber-500 text-gray-900'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          All
        </button>
        {TEMPLATE_TYPES.map((type) => (
          <button
            key={type.value}
            onClick={() => setSelectedType(type.value)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedType === type.value
                ? 'bg-amber-500 text-gray-900'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={templates}
        loading={loading}
        emptyMessage="No templates found"
      />

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-white mb-6">
              {editingTemplate ? 'Edit Template' : 'Create Template'}
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Template Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="e.g., Pattern Alert"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {TEMPLATE_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Use {{variable}} for dynamic content"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Body *</label>
                <textarea
                  id="template-body"
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  placeholder="Template body with {{variables}}"
                  rows={4}
                />
              </div>

              {/* Variable Suggestions */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Available Variables</label>
                <div className="flex flex-wrap gap-2">
                  {VARIABLE_SUGGESTIONS.map((v) => (
                    <button
                      key={v.key}
                      type="button"
                      onClick={() => insertVariable(v.key)}
                      className="px-3 py-1 bg-gray-700 text-amber-500 rounded hover:bg-gray-600 text-sm"
                      title={v.description}
                    >
                      {v.key}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Image (Optional)</label>
                <ImageUploader
                  value={formData.image_url}
                  onChange={(url) => setFormData({ ...formData, image_url: url })}
                  bucket="template-images"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Deep Link (Optional)</label>
                <DeepLinkPicker
                  value={formData.deep_link}
                  onChange={(link) => setFormData({ ...formData, deep_link: link })}
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="is_active" className="text-gray-300">Active</label>
              </div>

              {/* Preview */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Preview</label>
                <div className="bg-gray-900 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-900 font-bold">G</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">
                        {formData.title || 'Template Title'}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {formData.body || 'Template body text...'}
                      </p>
                    </div>
                    {formData.image_url && (
                      <img src={formData.image_url} alt="" className="w-16 h-16 rounded object-cover" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.name || !formData.title || !formData.body}
                className="px-4 py-2 bg-amber-500 text-gray-900 rounded-lg hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingTemplate ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Template"
        message="Are you sure you want to delete this template? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
