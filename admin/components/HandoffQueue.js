/**
 * Handoff Queue Component
 * Shows pending handoff requests and allows agent assignment
 */

import React, { useState } from 'react';

const priorityColors = {
  1: 'bg-red-500',
  2: 'bg-orange-500',
  3: 'bg-yellow-500',
  4: 'bg-blue-500',
  5: 'bg-gray-500',
};

const priorityLabels = {
  1: 'Critical',
  2: 'High',
  3: 'Medium',
  4: 'Low',
  5: 'Normal',
};

const reasonLabels = {
  user_request: 'User Request',
  high_urgency: 'High Urgency',
  complex_issue: 'Complex Issue',
  negative_emotion: 'Negative Emotion',
  repeated_failure: 'Repeated Failure',
};

export default function HandoffQueue({
  queue = [],
  agents = [],
  onAssign,
  onResolve,
  loading = false,
}) {
  const [selectedHandoff, setSelectedHandoff] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  const availableAgents = agents.filter((a) => a.status === 'online' && a.current_chats < a.max_concurrent_chats);

  const handleAssign = () => {
    if (selectedHandoff && selectedAgent) {
      onAssign(selectedHandoff.id, selectedAgent);
      setSelectedHandoff(null);
      setSelectedAgent('');
    }
  };

  const handleResolve = () => {
    if (selectedHandoff) {
      onResolve(selectedHandoff.id, resolutionNotes);
      setSelectedHandoff(null);
      setResolutionNotes('');
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-700 rounded mb-3"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-white">Handoff Queue</h3>
          {queue.length > 0 && (
            <span className="px-2 py-1 bg-red-500/20 text-red-500 text-sm rounded-full">
              {queue.length} pending
            </span>
          )}
        </div>

        <div className="text-sm text-gray-400">
          {availableAgents.length} agents available
        </div>
      </div>

      {/* Queue List */}
      <div className="divide-y divide-gray-700 max-h-96 overflow-y-auto">
        {queue.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <svg
              className="w-12 h-12 mx-auto mb-3 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p>No pending handoffs</p>
          </div>
        ) : (
          queue.map((handoff) => (
            <div
              key={handoff.id}
              className={`p-4 hover:bg-gray-750 cursor-pointer transition-colors ${
                selectedHandoff?.id === handoff.id ? 'bg-gray-750' : ''
              }`}
              onClick={() => setSelectedHandoff(handoff)}
            >
              <div className="flex items-start space-x-3">
                {/* Priority Indicator */}
                <div
                  className={`w-2 h-full min-h-[60px] rounded-full ${
                    priorityColors[handoff.priority] || priorityColors[5]
                  }`}
                />

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white">{handoff.user_name}</span>
                    <span className="text-xs text-gray-400">#{handoff.position}</span>
                  </div>

                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs px-2 py-0.5 bg-gray-700 text-gray-300 rounded">
                      {handoff.platform}
                    </span>
                    <span className="text-xs text-gray-400">
                      {reasonLabels[handoff.reason] || handoff.reason}
                    </span>
                  </div>

                  <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                    {handoff.summary || 'No summary available'}
                  </p>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      Waiting: {handoff.wait_time}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        priorityColors[handoff.priority]
                      }/20 ${priorityColors[handoff.priority].replace('bg-', 'text-')}`}
                    >
                      {priorityLabels[handoff.priority] || 'Normal'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Action Panel */}
      {selectedHandoff && (
        <div className="p-4 border-t border-gray-700 bg-gray-850">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-white">
              Selected: {selectedHandoff.user_name}
            </span>
            <button
              onClick={() => setSelectedHandoff(null)}
              className="text-gray-400 hover:text-white"
            >
              &times;
            </button>
          </div>

          {selectedHandoff.status === 'waiting' ? (
            <div className="space-y-3">
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Select agent...</option>
                {availableAgents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} ({agent.current_chats}/{agent.max_concurrent_chats})
                  </option>
                ))}
              </select>
              <button
                onClick={handleAssign}
                disabled={!selectedAgent}
                className="w-full px-4 py-2 bg-amber-500 text-gray-900 rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-50"
              >
                Assign to Agent
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Resolution notes..."
                rows={2}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              />
              <button
                onClick={handleResolve}
                className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-400 transition-colors"
              >
                Mark Resolved
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
