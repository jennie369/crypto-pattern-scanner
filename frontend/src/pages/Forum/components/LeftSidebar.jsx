import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabaseClient';
import {
  Home,
  TrendingUp,
  Hash,
  Newspaper,
  Bell,
  GraduationCap,
  Users,
  Sparkles,
  Heart,
  Bookmark,
  ChevronDown,
  ChevronRight,
  Target,
  DollarSign,
  Gem,
  Compass,
  Star,
  Rocket,
  Crosshair,
  Coins,
  Rss,
  Plus,
  Edit3,
  Award,
  Trash2,
  X
} from 'lucide-react';
import './LeftSidebar.css';

/**
 * LeftSidebar Component - ENHANCED
 * Left column of 3-column Community Hub
 *
 * Enhanced:
 * - Custom feeds section with create/edit/delete
 * - Karma level display
 * - Better mobile drawer behavior
 */
export default function LeftSidebar({
  categories = [],
  selectedCategory = 'all',
  onCategoryChange,
  selectedFeed = 'explore',
  onFeedChange,
  onQuickAction,
  customFeeds = [],
  onCreateFeed,
  onEditFeeds
}) {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Expanded states
  const [tradingExpanded, setTradingExpanded] = useState(true);
  const [wellnessExpanded, setWellnessExpanded] = useState(false);
  const [prosperityExpanded, setProsperityExpanded] = useState(false);
  const [earnExpanded, setEarnExpanded] = useState(false);
  const [customExpanded, setCustomExpanded] = useState(true);

  // Trending hashtags
  const [trendingHashtags, setTrendingHashtags] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(false);

  // Karma
  const [karmaData, setKarmaData] = useState(null);

  // Custom feed modal
  const [showCreateFeedModal, setShowCreateFeedModal] = useState(false);
  const [newFeedName, setNewFeedName] = useState('');

  useEffect(() => {
    loadTrendingHashtags();
    if (user) loadKarma();
  }, [user]);

  const loadTrendingHashtags = async () => {
    setLoadingTrending(true);
    try {
      const { data } = await supabase.rpc('get_trending_hashtags', { result_limit: 5 });
      if (data && data.length > 0) {
        setTrendingHashtags(data);
      } else {
        // Fallback mock data
        setTrendingHashtags([
          { hashtag: 'bitcoin', count: 1234 },
          { hashtag: 'ethereum', count: 892 },
          { hashtag: 'trading', count: 756 },
          { hashtag: 'crystal', count: 543 },
          { hashtag: 'mindset', count: 421 }
        ]);
      }
    } catch {
      setTrendingHashtags([
        { hashtag: 'bitcoin', count: 1234 },
        { hashtag: 'ethereum', count: 892 },
        { hashtag: 'trading', count: 756 },
        { hashtag: 'crystal', count: 543 },
        { hashtag: 'mindset', count: 421 }
      ]);
    } finally {
      setLoadingTrending(false);
    }
  };

  const loadKarma = async () => {
    try {
      const { data } = await supabase.rpc('get_user_karma_full', { p_user_id: user.id });
      if (data) setKarmaData(data);
    } catch {
      // Karma RPC may not exist yet — silently ignore
    }
  };

  const handleHashtagClick = (hashtag) => {
    navigate(`/forum/hashtag/${hashtag}`);
  };

  const handleCreateCustomFeed = async () => {
    if (!newFeedName.trim() || !user) return;
    try {
      await supabase
        .from('custom_feeds')
        .insert({ user_id: user.id, name: newFeedName.trim(), filters: {} });
      setNewFeedName('');
      setShowCreateFeedModal(false);
      onCreateFeed?.();
    } catch (err) {
      console.error('[LeftSidebar] Create feed error:', err);
      alert('Không thể tạo feed. Vui lòng thử lại.');
    }
  };

  const handleDeleteCustomFeed = async (feedId) => {
    if (!window.confirm('Xóa feed này?')) return;
    try {
      await supabase.from('custom_feeds').delete().eq('id', feedId).eq('user_id', user.id);
      onEditFeeds?.();
    } catch (err) {
      console.error('[LeftSidebar] Delete feed error:', err);
    }
  };

  // Feed types
  const mainFeeds = [
    { id: 'explore', label: 'Khám phá', icon: Sparkles },
    { id: 'following', label: 'Theo dõi', icon: Users },
    { id: 'popular', label: 'Phổ biến', icon: TrendingUp },
    { id: 'news', label: 'Tin tức', icon: Newspaper }
  ];

  // Category feeds
  const categoryFeeds = {
    trading: {
      section: 'GIAO DỊCH',
      sectionIcon: Crosshair,
      items: [
        { id: 'trading', title: 'Phân Tích', icon: TrendingUp },
        { id: 'patterns', title: 'Tips Hay', icon: Target },
        { id: 'results', title: 'Kết Quả', icon: DollarSign }
      ]
    },
    wellness: {
      section: 'TINH THẦN',
      sectionIcon: Compass,
      items: [
        { id: 'wellness', title: 'Crystal', icon: Gem },
        { id: 'meditation', title: 'Luật Hấp Dẫn', icon: Sparkles },
        { id: 'growth', title: 'Chữa Lành', icon: Users }
      ]
    },
    prosperity: {
      section: 'THỊNH VƯỢNG',
      sectionIcon: Star,
      items: [
        { id: 'mindful-trading', title: 'Chánh Niệm', icon: Target },
        { id: 'sieu-giau', title: 'Thành Công', icon: Rocket }
      ]
    },
    earn: {
      section: 'KIẾM TIỀN',
      sectionIcon: Coins,
      items: [
        { id: 'earn', title: 'Affiliate', icon: DollarSign }
      ]
    }
  };

  const renderCategorySection = (key, section, isExpanded, setExpanded) => {
    const SectionIcon = section.sectionIcon;

    return (
      <div className="feed-section" key={key}>
        <button
          className="section-header"
          onClick={() => setExpanded(!isExpanded)}
        >
          <span className="section-icon"><SectionIcon size={12} /></span>
          <span className="section-title">{section.section}</span>
          <span className="section-chevron">
            {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </span>
        </button>

        {isExpanded && (
          <div className="section-items">
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = selectedFeed === item.id;

              return (
                <button
                  key={item.id}
                  className={`feed-item ${isActive ? 'active' : ''}`}
                  onClick={() => onFeedChange?.(item.id)}
                >
                  <span className="feed-icon"><Icon size={14} /></span>
                  <span className="feed-item-title">{item.title}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Karma level calc
  const karmaLevel = karmaData ? Math.floor((karmaData.total_karma || 0) / 100) + 1 : 1;
  const karmaProgress = karmaData ? ((karmaData.total_karma || 0) % 100) : 0;

  return (
    <aside className="left-sidebar">
      {/* Karma Display */}
      {user && (
        <div className="karma-display">
          <div className="karma-header">
            <Award size={14} className="karma-icon" />
            <span className="karma-label">Karma Level {karmaLevel}</span>
          </div>
          <div className="karma-bar">
            <div
              className="karma-bar-fill"
              style={{ width: `${karmaProgress}%` }}
            />
          </div>
          <span className="karma-points">
            {karmaData?.total_karma || 0} điểm
          </span>
        </div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions">
        <button
          className={`quick-action-btn ${selectedFeed === 'liked' ? 'active' : ''}`}
          onClick={() => onQuickAction?.('liked')}
        >
          <Heart size={14} className="quick-icon liked" />
          <span>Thích</span>
        </button>
        <button
          className={`quick-action-btn ${selectedFeed === 'saved' ? 'active' : ''}`}
          onClick={() => onQuickAction?.('saved')}
        >
          <Bookmark size={14} className="quick-icon saved" />
          <span>Lưu</span>
        </button>
      </div>

      {/* Main Feeds */}
      <div className="feed-section main-feeds">
        <div className="section-header-row">
          <Rss size={12} className="section-icon" />
          <span className="section-title">NGUỒN TIN</span>
        </div>

        <div className="section-items">
          {mainFeeds.map((feed) => {
            const Icon = feed.icon;
            const isActive = selectedFeed === feed.id;

            return (
              <button
                key={feed.id}
                className={`feed-item ${isActive ? 'active' : ''}`}
                onClick={() => onFeedChange?.(feed.id)}
              >
                <Icon size={14} className="feed-icon" />
                <span className="feed-item-title">{feed.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Feeds */}
      {renderCategorySection('trading', categoryFeeds.trading, tradingExpanded, setTradingExpanded)}
      {renderCategorySection('wellness', categoryFeeds.wellness, wellnessExpanded, setWellnessExpanded)}
      {renderCategorySection('prosperity', categoryFeeds.prosperity, prosperityExpanded, setProsperityExpanded)}
      {renderCategorySection('earn', categoryFeeds.earn, earnExpanded, setEarnExpanded)}

      {/* Trending Hashtags */}
      {trendingHashtags.length > 0 && (
        <div className="feed-section trending-section">
          <div className="section-header-row">
            <Hash size={12} className="section-icon trending" />
            <span className="section-title">XU HƯỚNG</span>
          </div>

          <div className="trending-items">
            {loadingTrending ? (
              <div className="trending-loading">Đang tải...</div>
            ) : (
              trendingHashtags.slice(0, 5).map((item, index) => (
                <button
                  key={`trending-${index}`}
                  className="trending-item"
                  onClick={() => handleHashtagClick(item.hashtag)}
                >
                  <Hash size={12} className="trending-icon" />
                  <span className="hashtag-name">#{item.hashtag}</span>
                  <span className="hashtag-count">{item.count}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Custom Feeds */}
      <div className="feed-section">
        <button
          className="section-header"
          onClick={() => setCustomExpanded(!customExpanded)}
        >
          <Sparkles size={12} className="section-icon" />
          <span className="section-title">TÙY CHỈNH</span>
          <span className="feed-count">{customFeeds.length}</span>
          <span className="section-chevron">
            {customExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </span>
        </button>

        {customExpanded && (
          <div className="section-items">
            {customFeeds.length > 0 ? (
              customFeeds.map((feed) => (
                <div key={feed.id} className="custom-feed-row">
                  <button
                    className={`feed-item ${selectedFeed === `custom-${feed.id}` ? 'active' : ''}`}
                    onClick={() => onFeedChange?.(`custom-${feed.id}`)}
                  >
                    <Sparkles size={14} className="feed-icon" />
                    <span className="feed-item-title">{feed.name}</span>
                  </button>
                  <button
                    className="delete-feed-btn"
                    onClick={() => handleDeleteCustomFeed(feed.id)}
                    title="Xóa feed"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))
            ) : (
              <div className="custom-feeds-empty">
                <span>Chưa có feed tùy chỉnh</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Feed */}
      <div className="feed-actions">
        <button
          className="feed-action-btn"
          onClick={() => setShowCreateFeedModal(true)}
        >
          <Plus size={12} />
          <span>Tạo Feed</span>
        </button>
      </div>

      {/* Create Feed Modal (inline) */}
      {showCreateFeedModal && (
        <div className="create-feed-inline">
          <div className="create-feed-header">
            <span>Tạo Feed Mới</span>
            <button onClick={() => setShowCreateFeedModal(false)}>
              <X size={14} />
            </button>
          </div>
          <input
            type="text"
            className="create-feed-input"
            value={newFeedName}
            onChange={(e) => setNewFeedName(e.target.value)}
            placeholder="Tên feed..."
            maxLength={50}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateCustomFeed()}
          />
          <button
            className="create-feed-submit"
            onClick={handleCreateCustomFeed}
            disabled={!newFeedName.trim()}
          >
            Tạo
          </button>
        </div>
      )}
    </aside>
  );
}
