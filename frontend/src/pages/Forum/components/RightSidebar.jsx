import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Users,
  Sparkles,
  MessageCircle,
  Heart,
  Eye,
  ChevronRight,
  Flame,
  Search,
  Star,
  Target
} from 'lucide-react';
import { forumService } from '../../../services/forum';
import './RightSidebar.css';

/**
 * RightSidebar Component - DAY 3 IMPLEMENTATION + COMPACT DESIGN
 * Right column of 3-column Community Hub - MAXIMUM HEIGHT
 *
 * Features:
 * - Trending topics (most liked/commented posts from last 7 days)
 * - Suggested creators (top contributors by posts/likes)
 * - GEM Chatbot widget (link to AI chatbot)
 * - COMPACT DESIGN: All cards smaller with tight spacing to fit on screen
 * - MAXIMUM HEIGHT: Sidebar properly calculated (100vh - navbar - padding)
 */
export default function RightSidebar() {
  const navigate = useNavigate();
  const [trending, setTrending] = useState([]);
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [onlineCount, setOnlineCount] = useState(0);

  /**
   * Load sidebar data on mount
   */
  useEffect(() => {
    loadSidebarData();
  }, []);

  /**
   * Load all sidebar data
   */
  const loadSidebarData = async () => {
    try {
      setLoading(true);

      const [trendingData, creatorsData, onlineUsers] = await Promise.all([
        forumService.getTrendingTopics(),
        forumService.getSuggestedCreators(),
        forumService.getOnlineUsersCount()
      ]);

      setTrending(trendingData || []);
      setCreators(creatorsData || []);
      setOnlineCount(onlineUsers || 0);
    } catch (err) {
      console.error('Error loading sidebar data:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Navigate to thread
   */
  const goToThread = (threadId) => {
    navigate(`/forum/thread/${threadId}`);
  };

  /**
   * Navigate to chatbot - LINKED & WORKING
   */
  const goToChatbot = () => {
    navigate('/chatbot');
  };

  return (
    <aside className="right-sidebar">
      {/* ═══════════════════════════════════════════════════════════
          SEARCH BOX
          ═══════════════════════════════════════════════════════════ */}
      <div className="sidebar-search">
        <Search size={18} />
        <input
          type="text"
          placeholder="Tìm kiếm bài viết..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SPONSOR WIDGET - MOVED TO TOP
          ═══════════════════════════════════════════════════════════ */}
      <div className="sidebar-widget sponsor-widget">
        <div className="sidebar-widget-header">
          <Star size={20} />
          <h3 className="sidebar-widget-title">Đối tác</h3>
        </div>

        <div className="sponsor-content">
          <div className="sponsor-card">
            <div className="sponsor-logo">
              <Star size={40} />
            </div>
            <h4 className="sponsor-name">Premium Partner</h4>
            <p className="sponsor-description">
              Nhà tài trợ chính thức của GEM Pattern Scanner
            </p>
            <a href="#" className="sponsor-link">
              Tìm hiểu thêm →
            </a>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          TRENDING TOPICS WIDGET
          ═══════════════════════════════════════════════════════════ */}
      <div className="sidebar-widget">
        <div className="sidebar-widget-header">
          <TrendingUp size={20} />
          <h3 className="sidebar-widget-title">Trending</h3>
          <Flame size={16} className="flame-icon" />
        </div>

        <div className="trending-list">
          {loading ? (
            <div className="widget-loading">
              <div className="mini-spinner" />
              <p>Đang tải...</p>
            </div>
          ) : trending.length > 0 ? (
            trending.map((topic, index) => (
              <div
                key={topic.id}
                className="trending-item"
                onClick={() => goToThread(topic.id)}
              >
                <div className="trending-rank">#{index + 1}</div>
                <div className="trending-content">
                  <h4 className="trending-title">{topic.title}</h4>
                  <div className="trending-stats">
                    <span className="stat">
                      <Heart size={12} />
                      {topic.like_count || 0}
                    </span>
                    <span className="stat">
                      <MessageCircle size={12} />
                      {topic.reply_count || 0}
                    </span>
                    <span className="stat">
                      <Eye size={12} />
                      {topic.view_count || 0}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="widget-empty">
              <TrendingUp size={32} />
              <p>Chưa có topic trending</p>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          ONLINE USERS WIDGET
          ═══════════════════════════════════════════════════════════ */}
      <div className="sidebar-widget">
        <div className="sidebar-widget-header">
          <Users size={20} />
          <h3 className="sidebar-widget-title">Đang online</h3>
          <span className="online-badge">{onlineCount}</span>
        </div>

        <div className="online-indicator-text">
          <div className="pulse-dot"></div>
          <p>{onlineCount} thành viên đang hoạt động</p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SUGGESTED CREATORS WIDGET
          ═══════════════════════════════════════════════════════════ */}
      <div className="sidebar-widget">
        <div className="sidebar-widget-header">
          <Users size={20} />
          <h3 className="sidebar-widget-title">Thành viên nổi bật</h3>
        </div>

        <div className="creators-list">
          {loading ? (
            <div className="widget-loading">
              <div className="mini-spinner" />
              <p>Đang tải...</p>
            </div>
          ) : creators.length > 0 ? (
            creators.map((creator) => (
              <div key={creator.id} className="creator-item">
                <div className="creator-avatar">
                  {creator.avatar_url ? (
                    <img src={creator.avatar_url} alt={creator.display_name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {creator.display_name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </div>

                <div className="creator-info">
                  <h4 className="creator-name">{creator.display_name || 'Ẩn danh'}</h4>
                  <div className="creator-stats">
                    <span className="stat-label">
                      {creator.post_count || 0} bài viết
                    </span>
                    <span className="stat-separator">•</span>
                    <span className="stat-label">
                      {creator.total_likes || 0} ❤️
                    </span>
                  </div>
                </div>

                {/* Tier Badge */}
                {creator.scanner_tier && (
                  <div className={`tier-badge tier-${creator.scanner_tier.toLowerCase()}`}>
                    {creator.scanner_tier}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="widget-empty">
              <Users size={32} />
              <p>Chưa có thành viên nổi bật</p>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          GEM CHATBOT WIDGET
          ═══════════════════════════════════════════════════════════ */}
      <div className="sidebar-widget chatbot-widget">
        <div className="sidebar-widget-header">
          <Sparkles size={20} />
          <h3 className="sidebar-widget-title">Gemral</h3>
        </div>

        <div className="chatbot-content">
          <div className="chatbot-icon">
            <Sparkles size={48} />
          </div>

          <h4 className="chatbot-heading">Trợ lý AI của bạn</h4>
          <p className="chatbot-description">
            Chiến lược trading & nhận dạng pattern
          </p>

          <button className="chatbot-btn" onClick={goToChatbot}>
            <span>Bắt đầu chat</span>
            <ChevronRight size={18} />
          </button>

          <div className="chatbot-features">
            <div className="feature-tag">
              <Target size={12} />
              <span>Phân tích</span>
            </div>
            <div className="feature-tag">
              <TrendingUp size={12} />
              <span>Trading</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
