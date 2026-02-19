import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabaseClient';
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
  Target,
  Award,
  Crown
} from 'lucide-react';
import { forumService } from '../../../services/forum';
import './RightSidebar.css';

/**
 * RightSidebar Component - ENHANCED
 * Right column of 3-column Community Hub
 *
 * Enhanced:
 * - Karma leaderboard section
 * - More trending topics
 * - Better mobile behavior
 */
export default function RightSidebar() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [trending, setTrending] = useState([]);
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [onlineCount, setOnlineCount] = useState(0);
  const [karmaLeaderboard, setKarmaLeaderboard] = useState([]);

  useEffect(() => {
    loadSidebarData();
  }, []);

  const loadSidebarData = async () => {
    try {
      setLoading(true);

      const [trendingData, creatorsData, onlineUsers] = await Promise.all([
        forumService.getTrendingTopics(8),
        forumService.getSuggestedCreators(),
        forumService.getOnlineUsersCount()
      ]);

      setTrending(trendingData || []);
      setCreators(creatorsData || []);
      setOnlineCount(onlineUsers || 0);

      // Load karma leaderboard
      loadKarmaLeaderboard();
    } catch (err) {
      console.error('Error loading sidebar data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadKarmaLeaderboard = async () => {
    try {
      const { data } = await supabase.rpc('get_karma_leaderboard', { result_limit: 5 });
      if (data) {
        setKarmaLeaderboard(data);
      }
    } catch {
      // Karma RPC may not exist — silently ignore
    }
  };

  const goToThread = (threadId) => {
    navigate(`/forum/thread/${threadId}`);
  };

  const goToChatbot = () => {
    navigate('/chatbot');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to forum with search query
      navigate(`/forum?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const getRankIcon = (index) => {
    if (index === 0) return <Crown size={14} className="rank-icon gold" />;
    if (index === 1) return <Crown size={14} className="rank-icon silver" />;
    if (index === 2) return <Crown size={14} className="rank-icon bronze" />;
    return <span className="rank-number">#{index + 1}</span>;
  };

  return (
    <aside className="right-sidebar">
      {/* Search Box */}
      <form className="sidebar-search" onSubmit={handleSearch}>
        <Search size={18} />
        <input
          type="text"
          placeholder="Tìm kiếm bài viết..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </form>

      {/* Sponsor Widget */}
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

      {/* Trending Topics Widget - ENHANCED with more items */}
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
            trending.slice(0, 8).map((topic, index) => (
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
                      {topic.likes_count || topic.like_count || 0}
                    </span>
                    <span className="stat">
                      <MessageCircle size={12} />
                      {topic.comments_count || topic.reply_count || 0}
                    </span>
                    <span className="stat">
                      <Eye size={12} />
                      {topic.views_count || topic.view_count || 0}
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

      {/* Karma Leaderboard Widget - NEW */}
      {karmaLeaderboard.length > 0 && (
        <div className="sidebar-widget karma-widget">
          <div className="sidebar-widget-header">
            <Award size={20} />
            <h3 className="sidebar-widget-title">Karma</h3>
          </div>

          <div className="karma-leaderboard">
            {karmaLeaderboard.map((entry, index) => (
              <div
                key={entry.user_id || index}
                className={`karma-entry ${index < 3 ? 'top-3' : ''}`}
                onClick={() => navigate(`/forum/user/${entry.user_id}`)}
              >
                <div className="karma-rank">
                  {getRankIcon(index)}
                </div>
                <div className="karma-user-avatar">
                  {entry.avatar_url ? (
                    <img src={entry.avatar_url} alt={entry.display_name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {(entry.display_name || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="karma-user-info">
                  <span className="karma-user-name">{entry.display_name || 'Ẩn danh'}</span>
                  <span className="karma-score">{entry.total_karma || 0} điểm</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Online Users Widget */}
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

      {/* Suggested Creators Widget */}
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
              <div
                key={creator.id}
                className="creator-item"
                onClick={() => navigate(`/forum/user/${creator.id}`)}
                style={{ cursor: 'pointer' }}
              >
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
                    <span className="stat-separator">·</span>
                    <span className="stat-label">
                      {creator.total_likes || 0} ❤️
                    </span>
                  </div>
                </div>

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

      {/* GEM Chatbot Widget */}
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
