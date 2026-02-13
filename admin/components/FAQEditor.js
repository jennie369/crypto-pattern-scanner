/**
 * FAQ Editor Component
 * Form for creating and editing FAQ entries
 */

import React, { useState, useEffect } from 'react';

const categories = [
  { value: 'general', label: 'General' },
  { value: 'products', label: 'Products' },
  { value: 'orders', label: 'Orders' },
  { value: 'shipping', label: 'Shipping' },
  { value: 'returns', label: 'Returns' },
  { value: 'payment', label: 'Payment' },
  { value: 'account', label: 'Account' },
  { value: 'trading', label: 'Trading' },
  { value: 'gemral', label: 'Gemral AI' },
  { value: 'courses', label: 'Courses' },
];

export default function FAQEditor({ faq, onSave, onCancel, loading = false }) {
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'general',
    keywords: [],
    is_active: true,
  });

  const [keywordInput, setKeywordInput] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (faq) {
      setFormData({
        question: faq.question || '',
        answer: faq.answer || '',
        category: faq.category || 'general',
        keywords: faq.keywords || [],
        is_active: faq.is_active !== false,
      });
    }
  }, [faq]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const addKeyword = () => {
    const keyword = keywordInput.trim().toLowerCase();
    if (keyword && !formData.keywords.includes(keyword)) {
      setFormData((prev) => ({
        ...prev,
        keywords: [...prev.keywords, keyword],
      }));
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword) => {
    setFormData((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((k) => k !== keyword),
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.question.trim()) {
      newErrors.question = 'Question is required';
    }
    if (!formData.answer.trim()) {
      newErrors.answer = 'Answer is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Question */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Question</label>
        <input
          type="text"
          name="question"
          value={formData.question}
          onChange={handleChange}
          placeholder="Enter the FAQ question..."
          className={`w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
            errors.question ? 'ring-2 ring-red-500' : ''
          }`}
        />
        {errors.question && <p className="mt-1 text-sm text-red-500">{errors.question}</p>}
      </div>

      {/* Answer */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Answer</label>
        <textarea
          name="answer"
          value={formData.answer}
          onChange={handleChange}
          rows={6}
          placeholder="Enter the answer..."
          className={`w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none ${
            errors.answer ? 'ring-2 ring-red-500' : ''
          }`}
        />
        {errors.answer && <p className="mt-1 text-sm text-red-500">{errors.answer}</p>}
        <p className="mt-1 text-xs text-gray-400">
          Supports markdown formatting. Use \n for line breaks.
        </p>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Keywords */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Keywords</label>
        <div className="flex space-x-2 mb-2">
          <input
            type="text"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
            placeholder="Add keyword..."
            className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            type="button"
            onClick={addKeyword}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.keywords.map((keyword) => (
            <span
              key={keyword}
              className="inline-flex items-center px-3 py-1 bg-amber-500/20 text-amber-500 rounded-full text-sm"
            >
              {keyword}
              <button
                type="button"
                onClick={() => removeKeyword(keyword)}
                className="ml-2 hover:text-amber-300"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
        <p className="mt-1 text-xs text-gray-400">
          Keywords help match user questions to this FAQ
        </p>
      </div>

      {/* Active Status */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_active"
          name="is_active"
          checked={formData.is_active}
          onChange={handleChange}
          className="w-4 h-4 text-amber-500 bg-gray-700 border-gray-600 rounded focus:ring-amber-500"
        />
        <label htmlFor="is_active" className="ml-2 text-sm text-gray-300">
          Active (visible to users)
        </label>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-amber-500 text-gray-900 rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : faq ? 'Update FAQ' : 'Create FAQ'}
        </button>
      </div>
    </form>
  );
}
