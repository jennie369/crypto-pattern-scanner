/**
 * Chat Monitor Component
 * Real-time chat monitoring panel
 */

import React, { useState, useEffect } from 'react';

const platformColors = {
  zalo: 'bg-blue-500',
  messenger: 'bg-indigo-500',
  web: 'bg-amber-500',
};

const platformIcons = {
  zalo: 'Z',
  messenger: 'M',
  web: 'W',
};

const emotionEmojis = {
  happy: '😊',
  sad: '😢',
  angry: '😠',
  frustrated: '😤',
  anxious: '😰',
  neutral: '😐',
};

export default function ChatMonitor({ conversations = [], onSelect }) {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter((conv) => {
    if (filter !== 'all' && conv.platform !== filter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        conv.user_name?.toLowerCase().includes(query) ||
        conv.last_message?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-3">Live Conversations</h3>

        {/* Search */}
        <div className="relative mb-3">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <svg
            className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Platform Filters */}
        <div className="flex space-x-2">
          {['all', 'zalo', 'messenger', 'web'].map((platform) => (
            <button
              key={platform}
              onClick={() => setFilter(platform)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                filter === platform
                  ? 'bg-amber-500 text-gray-900'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {platform === 'all' ? 'All' : platform.charAt(0).toUpperCase() + platform.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-400">
            No active conversations
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => onSelect && onSelect(conv)}
              className={`p-4 border-b border-gray-700 hover:bg-gray-750 cursor-pointer transition-colors ${
                conv.unread ? 'bg-gray-750' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                {/* Platform Badge */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                    platformColors[conv.platform] || 'bg-gray-600'
                  }`}
                >
                  {platformIcons[conv.platform] || '?'}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white truncate">{conv.user_name}</span>
                    <span className="text-xs text-gray-400">{conv.time_ago}</span>
                  </div>

                  <p className="text-sm text-gray-400 truncate mt-1">{conv.last_message}</p>

                  <div className="flex items-center mt-2 space-x-2">
                    {/* Emotion Badge */}
                    {conv.emotion && (
                      <span className="text-sm" title={conv.emotion}>
                        {emotionEmojis[conv.emotion] || '😐'}
                      </span>
                    )}

                    {/* Status */}
                    {conv.status === 'waiting' && (
                      <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-500 text-xs rounded-full">
                        Waiting
                      </span>
                    )}
                    {conv.status === 'handoff' && (
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-500 text-xs rounded-full">
                        Handoff
                      </span>
                    )}
                    {conv.unread && (
                      <span className="px-2 py-0.5 bg-amber-500 text-gray-900 text-xs rounded-full font-medium">
                        {conv.unread} new
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats Footer */}
      <div className="p-4 border-t border-gray-700 bg-gray-850">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">
            Active: <span className="text-white">{filteredConversations.length}</span>
          </span>
          <span className="text-gray-400">
            Waiting:{' '}
            <span className="text-yellow-500">
              {filteredConversations.filter((c) => c.status === 'waiting').length}
            </span>
          </span>
          <span className="text-gray-400">
            Handoff:{' '}
            <span className="text-red-500">
              {filteredConversations.filter((c) => c.status === 'handoff').length}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
