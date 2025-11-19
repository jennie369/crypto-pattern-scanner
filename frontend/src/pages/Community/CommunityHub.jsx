import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  MessageSquare,
  Sparkles,
  Send,
  Calendar,
  Trophy,
  User,
  Star
} from 'lucide-react';

// Import tab components
import Forum from '../Forum/Forum3Column'; // Updated to use 3-column layout
import Chatbot from '../Chatbot';
import Messages from '../Messages/Messages';
import Events from '../Events/Events';
import Leaderboard from './Leaderboard';
import UserProfile from './UserProfile';
import './CommunityHub.css';

export default function CommunityHub() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get active tab from URL or default to forum
  const getActiveTab = () => {
    const pathParts = location.pathname.split('/');
    const tab = pathParts[pathParts.length - 1];
    return ['forum', 'chatbot', 'messages', 'events', 'leaderboard', 'profile'].includes(tab)
      ? tab
      : 'forum';
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());

  // Update active tab when URL changes
  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location.pathname]);

  const tabs = [
    {
      id: 'forum',
      label: 'Forum',
      icon: <MessageSquare size={20} />,
      component: Forum,
      description: 'Thảo luận cộng đồng'
    },
    {
      id: 'chatbot',
      label: 'Gem Master',
      icon: <Sparkles size={20} />,
      component: Chatbot,
      description: 'I Ching & Tarot'
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: <Send size={20} />,
      component: Messages,
      description: 'Tin nhắn riêng tư'
    },
    {
      id: 'events',
      label: 'Events',
      icon: <Calendar size={20} />,
      component: Events,
      description: 'Sự kiện cộng đồng'
    },
    {
      id: 'leaderboard',
      label: 'Leaderboard',
      icon: <Trophy size={20} />,
      component: Leaderboard,
      description: 'Bảng xếp hạng'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <User size={20} />,
      component: UserProfile,
      description: 'Hồ sơ của bạn'
    }
  ];

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || Forum;

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    navigate(`/community/${tabId}`, { preventScrollReset: true });
  };

  return (
    <div className="community-hub">
      <div className="community-content">
        {/* Header */}
        <div className="community-header">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Star size={32} style={{ color: '#FFBD59' }} />
            Community Hub
          </h1>
          <p>Kết nối, học hỏi và phát triển cùng cộng đồng GEM</p>
        </div>

        {/* Tab Navigation */}
        <div className="community-tabs card-glass">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`community-tab ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.icon}
              <span>{tab.label}</span>

              {/* Active indicator */}
              {activeTab === tab.id && (
                <div className="active-indicator" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
}
