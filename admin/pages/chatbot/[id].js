/**
 * Conversation Detail Page
 * View and manage a single conversation
 */

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import api from '../../services/api';

const platformColors = {
  zalo: 'bg-blue-500',
  messenger: 'bg-indigo-500',
  web: 'bg-amber-500',
};

const emotionIcons = {
  happy: '😊',
  neutral: '😐',
  confused: '😕',
  anxious: '😰',
  angry: '😠',
  sad: '😢',
};

export default function ConversationDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const messagesEndRef = useRef(null);

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (id) {
      loadConversation();
      loadMessages();
    }
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversation = async () => {
    try {
      const data = await api.getConversation(id);
      setConversation(data);
    } catch (error) {
      console.error('Error loading conversation:', error);
      // Mock data
      setConversation({
        id,
        platform: 'zalo',
        user_name: 'Nguyen Van A',
        phone: '0901234567',
        status: 'active',
        emotion: 'neutral',
        created_at: '2024-12-27T10:00:00Z',
        updated_at: '2024-12-27T14:30:00Z',
        message_count: 15,
        user: {
          tier: 'TIER_1',
          gems: 150,
          email: 'test@example.com',
        },
      });
    }
  };

  const loadMessages = async () => {
    setLoading(true);
    try {
      const data = await api.getMessages(id);
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      // Mock data
      setMessages([
        {
          id: '1',
          role: 'user',
          content: 'Xin chao, cho em hoi ve san pham',
          created_at: '2024-12-27T10:00:00Z',
        },
        {
          id: '2',
          role: 'assistant',
          content: 'Xin chao ban! Rat vui duoc ho tro. Ban muon hoi ve san pham nao a?',
          created_at: '2024-12-27T10:00:30Z',
        },
        {
          id: '3',
          role: 'user',
          content: 'Em muon mua khoa hoc trading',
          created_at: '2024-12-27T10:01:00Z',
        },
        {
          id: '4',
          role: 'assistant',
          content: 'Chung toi co nhieu khoa hoc trading phu hop voi cac cap do khac nhau:\n\n1. Frequency Trading Method (FTM) - 2,990,000 VND\n2. Scanner Mastery - 1,490,000 VND\n3. Psychology Trading - 990,000 VND\n\nBan quan tam khoa hoc nao a?',
          created_at: '2024-12-27T10:01:30Z',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      await api.sendAdminMessage(id, newMessage);
      setNewMessage('');
      loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await api.updateConversationStatus(id, newStatus);
      setConversation((prev) => ({ ...prev, status: newStatus }));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800 rounded-t-xl">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/chatbot')}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex items-center space-x-3">
            <span
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                platformColors[conversation.platform] || 'bg-gray-500'
              }`}
            >
              {conversation.platform?.charAt(0).toUpperCase()}
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-semibold text-white">{conversation.user_name}</h2>
                <span className="text-xl">{emotionIcons[conversation.emotion] || '😐'}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <span>{conversation.platform}</span>
                {conversation.phone && (
                  <>
                    <span>•</span>
                    <span>{conversation.phone}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Status Dropdown */}
          <select
            value={conversation.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="active">Active</option>
            <option value="waiting">Waiting</option>
            <option value="handoff">Handoff</option>
            <option value="resolved">Resolved</option>
          </select>

          {/* Actions */}
          <button className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-gray-850 p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            No messages yet
          </div>
        ) : (
          <>
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              const showDate =
                index === 0 ||
                formatDate(msg.created_at) !== formatDate(messages[index - 1].created_at);

              return (
                <React.Fragment key={msg.id}>
                  {showDate && (
                    <div className="flex items-center justify-center">
                      <span className="px-3 py-1 bg-gray-700 text-gray-400 text-xs rounded-full">
                        {formatDate(msg.created_at)}
                      </span>
                    </div>
                  )}
                  <div className={`flex ${isUser ? 'justify-start' : 'justify-end'}`}>
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        isUser ? 'bg-gray-700 text-white' : 'bg-amber-500 text-gray-900'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <div
                        className={`text-xs mt-1 ${
                          isUser ? 'text-gray-400' : 'text-amber-800'
                        }`}
                      >
                        {formatTime(msg.created_at)}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* User Info Sidebar (collapsible) */}
      <div className="absolute right-4 top-20 w-64 bg-gray-800 rounded-xl shadow-lg hidden lg:block">
        <div className="p-4 border-b border-gray-700">
          <h3 className="font-medium text-white">User Info</h3>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Tier</span>
            <span className="text-amber-500 font-medium">{conversation.user?.tier || 'FREE'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Gems</span>
            <span className="text-white">{conversation.user?.gems || 0}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Messages</span>
            <span className="text-white">{conversation.message_count}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Created</span>
            <span className="text-white">{formatDate(conversation.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 bg-gray-800 rounded-b-xl">
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message as admin..."
            className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-6 py-3 bg-amber-500 text-gray-900 rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
