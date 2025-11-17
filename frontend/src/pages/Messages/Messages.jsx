import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Search, Users, Plus, X, Smile, MoreVertical, Flag, UserX, AlertTriangle } from 'lucide-react';
import messagingService from '../../services/messaging';
import { useAuth } from '../../contexts/AuthContext';
import UserBadges from '../../components/UserBadge/UserBadges';
import EmojiPicker from '../../components/EmojiPicker/EmojiPicker';
import FileAttachment, { MessageAttachment } from '../../components/FileAttachment/FileAttachment';
import './Messages.css';

export default function Messages() {
  const { user, profile } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [otherUserId, setOtherUserId] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const subscriptionRef = useRef(null);
  const actionsMenuRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const presenceChannelRef = useRef(null);

  // Load conversations
  useEffect(() => {
    loadConversations();

    // Update online status
    messagingService.updateOnlineStatus('online');

    return () => {
      // Set offline when leaving
      messagingService.updateOnlineStatus('offline');

      // Cleanup subscription
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, []);

  // Subscribe to messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
      markAsRead(selectedConversation.id);

      // Subscribe to real-time updates
      subscriptionRef.current = messagingService.subscribeToMessages(
        selectedConversation.id,
        handleNewMessage
      );

      // Setup presence channel for typing indicators
      const { supabase } = messagingService;
      const channel = supabase.channel(`presence:${selectedConversation.id}`, {
        config: {
          presence: {
            key: user.id
          }
        }
      });

      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          // Check if other users are typing
          const otherUsers = Object.values(state).filter(
            (presence) => presence[0]?.user_id !== user.id && presence[0]?.typing === true
          );
          setOtherUserTyping(otherUsers.length > 0);
        })
        .subscribe();

      presenceChannelRef.current = channel;
    }

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
      if (presenceChannelRef.current) {
        presenceChannelRef.current.unsubscribe();
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [selectedConversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get other user ID and check if blocked
  useEffect(() => {
    if (selectedConversation && !selectedConversation.is_group) {
      // Get the other participant's ID
      const otherParticipantId = selectedConversation.participant_ids.find(id => id !== user.id);
      setOtherUserId(otherParticipantId);

      // Check if user is blocked
      if (otherParticipantId) {
        checkIfBlocked(otherParticipantId);
      }
    }
  }, [selectedConversation, user.id]);

  // Close actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target)) {
        setShowActionsMenu(false);
      }
    };

    if (showActionsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActionsMenu]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await messagingService.getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const data = await messagingService.getMessages(conversationId);
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const markAsRead = async (conversationId) => {
    try {
      await messagingService.markAsRead(conversationId);
      // Update local conversation list
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId
            ? { ...conv, conversation_participants: [{ ...conv.conversation_participants[0], unread_count: 0 }] }
            : conv
        )
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleNewMessage = (newMessage) => {
    // Add new message to the list
    setMessages(prev => [...prev, newMessage]);

    // Reload conversations to update latest message
    loadConversations();
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!messageInput.trim() && !attachment) || !selectedConversation) return;

    const messageContent = messageInput.trim();
    const messageAttachment = attachment;
    setMessageInput(''); // Clear input immediately
    setAttachment(null); // Clear attachment immediately

    try {
      setSending(true);

      // Optimistically add message to UI
      const tempMessage = {
        id: `temp-${Date.now()}`,
        conversation_id: selectedConversation.id,
        sender_id: user.id,
        content: messageContent,
        attachment_url: messageAttachment?.url,
        attachment_name: messageAttachment?.name,
        attachment_type: messageAttachment?.type,
        attachment_size: messageAttachment?.size,
        created_at: new Date().toISOString(),
        is_deleted: false,
        message_type: messageAttachment ? 'attachment' : 'text'
      };
      setMessages(prev => [...prev, tempMessage]);

      // Send to server with attachment data
      const sentMessage = await messagingService.sendMessage(
        selectedConversation.id,
        messageContent,
        messageAttachment
      );

      // Replace temp message with real one
      setMessages(prev => prev.map(m => m.id === tempMessage.id ? sentMessage : m));

      // Reload conversations to update latest message
      loadConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
      // Remove temp message on error
      setMessages(prev => prev.filter(m => !m.id.startsWith('temp-')));
      // Restore input and attachment
      setMessageInput(messageContent);
      setAttachment(messageAttachment);
    } finally {
      setSending(false);
    }
  };

  const handleEmojiSelect = (emoji) => {
    setMessageInput(prev => prev + emoji);
  };

  const handleTyping = () => {
    if (!selectedConversation || !presenceChannelRef.current) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Broadcast typing status
    if (!isTyping) {
      setIsTyping(true);
      presenceChannelRef.current.track({
        user_id: user.id,
        typing: true,
        display_name: profile?.display_name || 'User'
      });
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      presenceChannelRef.current?.track({
        user_id: user.id,
        typing: false
      });
    }, 2000);
  };

  const handleSearchUsers = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await messagingService.searchUsers(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const handleStartConversation = async (otherUser) => {
    try {
      const conversation = await messagingService.createConversation([otherUser.id, user.id]);

      if (!conversation) {
        throw new Error('Failed to create conversation');
      }

      // Close modal first
      setShowNewChat(false);
      setSearchQuery('');
      setSearchResults([]);

      // Reload conversations to get updated list
      await loadConversations();

      // Select the conversation to open chat
      setSelectedConversation(conversation);
    } catch (error) {
      console.error('Error creating conversation:', error);
      alert('Failed to start conversation. Please try again.');
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    // Less than 1 minute
    if (diff < 60000) return 'Just now';

    // Less than 1 hour
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;

    // Today
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }

    // This week
    if (diff < 604800000) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }

    // Older
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getOtherParticipantName = (conversation) => {
    if (conversation.is_group) return conversation.name;

    // For 1-1 chats, find the other participant
    const participants = Array.isArray(conversation.conversation_participants)
      ? conversation.conversation_participants
      : [];

    const otherParticipant = participants.find(p => p.user_id !== user.id);

    if (!otherParticipant) {
      return 'User';
    }

    return otherParticipant?.users?.display_name || otherParticipant?.users?.email || 'User';
  };

  const getOtherParticipantAvatar = (conversation) => {
    if (conversation.is_group) return null;

    const otherParticipant = conversation.conversation_participants?.find(
      p => p.user_id !== user.id
    );

    return otherParticipant?.users?.avatar_url;
  };

  const getOtherParticipantStatus = (conversation) => {
    if (conversation.is_group) return null;

    const otherParticipant = conversation.conversation_participants?.find(
      p => p.user_id !== user.id
    );

    return otherParticipant?.users?.online_status || 'offline';
  };

  // Check if user is blocked
  const checkIfBlocked = async (userId) => {
    try {
      const blocked = await messagingService.isUserBlocked(userId);
      setIsBlocked(blocked);
    } catch (error) {
      console.error('Error checking if user is blocked:', error);
    }
  };

  // Handle block user
  const handleBlockUser = async () => {
    if (!otherUserId) return;

    try {
      await messagingService.blockUser(otherUserId);
      setIsBlocked(true);
      setShowActionsMenu(false);
      alert('User has been blocked');
    } catch (error) {
      console.error('Error blocking user:', error);
      alert('Failed to block user');
    }
  };

  // Handle unblock user
  const handleUnblockUser = async () => {
    if (!otherUserId) return;

    try {
      await messagingService.unblockUser(otherUserId);
      setIsBlocked(false);
      setShowActionsMenu(false);
      alert('User has been unblocked');
    } catch (error) {
      console.error('Error unblocking user:', error);
      alert('Failed to unblock user');
    }
  };

  // Handle report user (opens modal)
  const handleReportClick = () => {
    setShowActionsMenu(false);
    setShowReportModal(true);
  };

  // Handle submit report
  const handleSubmitReport = async (reportType, description) => {
    if (!otherUserId) return;

    try {
      await messagingService.reportUser({
        reportedUserId: otherUserId,
        reportType,
        description
      });
      setShowReportModal(false);
      alert('Report submitted successfully. Thank you for keeping our community safe!');
    } catch (error) {
      console.error('Error reporting user:', error);
      alert('Failed to submit report');
    }
  };

  return (
    <div className="messages-page">
      <div className="messages-container">
        {/* Sidebar - Conversation List */}
        <div className="conversations-sidebar">
          <div className="sidebar-header">
            <h2><MessageSquare size={24} /> Messages</h2>
            <button className="btn-new-chat" onClick={() => setShowNewChat(true)}>
              <Plus size={20} />
            </button>
          </div>

          {/* Search Bar */}
          <div className="search-bar">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => handleSearchUsers(e.target.value)}
            />
          </div>

          {/* Conversation List */}
          <div className="conversations-list">
            {loading ? (
              <div className="loading-state">Loading conversations...</div>
            ) : conversations.length === 0 ? (
              <div className="empty-state">
                <MessageSquare size={48} />
                <p>No conversations yet</p>
                <button className="btn-primary" onClick={() => setShowNewChat(true)}>
                  Start a conversation
                </button>
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`conversation-item ${selectedConversation?.id === conv.id ? 'active' : ''}`}
                  onClick={() => setSelectedConversation(conv)}
                >
                  <div className="conversation-avatar">
                    {conv.is_group ? (
                      <Users size={24} />
                    ) : getOtherParticipantAvatar(conv) ? (
                      <img src={getOtherParticipantAvatar(conv)} alt={getOtherParticipantName(conv)} />
                    ) : (
                      <MessageSquare size={24} />
                    )}
                    {!conv.is_group && getOtherParticipantStatus(conv) === 'online' && (
                      <div className="online-indicator"></div>
                    )}
                  </div>
                  <div className="conversation-details">
                    <div className="conversation-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <h4>{getOtherParticipantName(conv)}</h4>
                        {!conv.is_group && (() => {
                          const otherParticipant = conv.conversation_participants?.find(p => p.user_id !== user.id);
                          return otherParticipant?.users ? <UserBadges user={otherParticipant.users} size="tiny" /> : null;
                        })()}
                      </div>
                      {conv.latest_message && (
                        <span className="conversation-time">
                          {formatTime(conv.latest_message.created_at)}
                        </span>
                      )}
                    </div>
                    <p className="conversation-preview">
                      {conv.latest_message?.content || 'No messages yet'}
                    </p>
                  </div>
                  {conv.conversation_participants[0]?.unread_count > 0 && (
                    <div className="unread-badge">
                      {conv.conversation_participants[0].unread_count}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="chat-area">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="chat-header">
                <div className="chat-header-info">
                  {!selectedConversation.is_group && getOtherParticipantAvatar(selectedConversation) && (
                    <div className="chat-avatar">
                      <img src={getOtherParticipantAvatar(selectedConversation)} alt={getOtherParticipantName(selectedConversation)} />
                      {getOtherParticipantStatus(selectedConversation) === 'online' && (
                        <div className="online-indicator"></div>
                      )}
                    </div>
                  )}
                  <div>
                    <h3>{getOtherParticipantName(selectedConversation)}</h3>
                    <span className={`online-status ${getOtherParticipantStatus(selectedConversation)}`}>
                      {getOtherParticipantStatus(selectedConversation) === 'online' ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
                {!selectedConversation.is_group && (
                  <div className="chat-header-actions" ref={actionsMenuRef}>
                    <button
                      className="btn-actions"
                      onClick={() => setShowActionsMenu(!showActionsMenu)}
                    >
                      <MoreVertical size={20} />
                    </button>
                    {showActionsMenu && (
                      <UserActionsMenu
                        isBlocked={isBlocked}
                        onBlock={handleBlockUser}
                        onUnblock={handleUnblockUser}
                        onReport={handleReportClick}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Messages */}
              <div className="messages-area">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`message ${msg.sender_id === user.id ? 'sent' : 'received'}`}
                  >
                    <div className="message-content">
                      {msg.is_deleted ? (
                        <em className="deleted-message">Message deleted</em>
                      ) : (
                        <>
                          {msg.content && <p>{msg.content}</p>}
                          {msg.attachment_url && (
                            <MessageAttachment
                              attachment={{
                                url: msg.attachment_url,
                                name: msg.attachment_name,
                                type: msg.attachment_type,
                                size: msg.attachment_size
                              }}
                            />
                          )}
                        </>
                      )}
                      <div className="message-footer">
                        <span className="message-time">{formatTime(msg.created_at)}</span>
                        {msg.sender_id === user.id && msg.read_at && (
                          <span className="message-read-receipt" title={`Seen ${formatTime(msg.read_at)}`}>
                            ✓✓
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {otherUserTyping && (
                  <div className="typing-indicator">
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <span className="typing-text">{getOtherParticipantName(selectedConversation)} is typing...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form className="message-input-form" onSubmit={handleSendMessage}>
                <EmojiPicker onEmojiSelect={handleEmojiSelect} showButton={true} />
                <FileAttachment
                  onFileSelect={setAttachment}
                  attachment={attachment}
                  onRemove={() => setAttachment(null)}
                />
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => {
                    setMessageInput(e.target.value);
                    handleTyping();
                  }}
                  disabled={sending}
                />
                <button type="submit" className="btn-send" disabled={sending || (!messageInput.trim() && !attachment)}>
                  <Send size={20} />
                </button>
              </form>
            </>
          ) : (
            <div className="no-conversation-selected">
              <MessageSquare size={64} />
              <h3>Select a conversation</h3>
              <p>Choose a conversation from the list or start a new one</p>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <div className="modal-overlay" onClick={() => setShowNewChat(false)}>
          <div className="modal new-chat-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>New Conversation</h3>
              <button className="btn-close" onClick={() => setShowNewChat(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="search-bar">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => handleSearchUsers(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="search-results">
                {searchResults.length === 0 && searchQuery.length >= 2 && (
                  <p className="no-results">No users found</p>
                )}
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="user-result"
                    onClick={() => handleStartConversation(user)}
                  >
                    <div className="user-avatar">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.display_name} />
                      ) : (
                        <MessageSquare size={24} />
                      )}
                    </div>
                    <div className="user-info">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <h4>{user.display_name}</h4>
                        <UserBadges user={user} size="tiny" />
                      </div>
                      <p>{user.email}</p>
                    </div>
                    <div className={`status-indicator ${user.online_status}`}></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <ReportModal
          onClose={() => setShowReportModal(false)}
          onSubmit={handleSubmitReport}
        />
      )}
    </div>
  );
}

// =====================================================
// UserActionsMenu Component
// =====================================================
function UserActionsMenu({ isBlocked, onBlock, onUnblock, onReport }) {
  return (
    <div className="user-actions-menu">
      {isBlocked ? (
        <button className="menu-item unblock" onClick={onUnblock}>
          <UserX size={16} />
          <span>Unblock User</span>
        </button>
      ) : (
        <button className="menu-item block" onClick={onBlock}>
          <UserX size={16} />
          <span>Block User</span>
        </button>
      )}
      <button className="menu-item report" onClick={onReport}>
        <Flag size={16} />
        <span>Report User</span>
      </button>
    </div>
  );
}

// =====================================================
// ReportModal Component
// =====================================================
function ReportModal({ onClose, onSubmit }) {
  const [reportType, setReportType] = useState('spam');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Please provide a description');
      return;
    }

    setSubmitting(true);
    await onSubmit(reportType, description.trim());
    setSubmitting(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal report-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-icon">
            <AlertTriangle size={24} className="warning-icon" />
            <h3>Report User</h3>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <form className="modal-body" onSubmit={handleSubmit}>
          <p className="report-description">
            Help us keep the community safe. Please select a reason and provide details about why you're reporting this user.
          </p>

          <div className="form-group">
            <label htmlFor="reportType">Reason for Report</label>
            <select
              id="reportType"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="form-select"
            >
              <option value="spam">Spam or Scam</option>
              <option value="harassment">Harassment or Bullying</option>
              <option value="inappropriate_content">Inappropriate Content</option>
              <option value="scam">Scam or Fraud</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide details about this report..."
              className="form-textarea"
              rows={5}
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-danger"
              disabled={submitting || !description.trim()}
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
