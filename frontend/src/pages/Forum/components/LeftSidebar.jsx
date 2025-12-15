import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Edit3
} from 'lucide-react';
import './LeftSidebar.css';

/**
 * LeftSidebar Component - SYNCED FROM MOBILE SideMenu
 * Left column of 3-column Community Hub
 *
 * Features (synced from Mobile):
 * - Quick Actions: Đã Thích, Đã Lưu
 * - Feed Types: Explore, Following, News, Popular, Academy
 * - Categories: Giao dịch, Tinh thần, Thịnh vượng, Kiếm tiền
 * - Trending Hashtags
 * - Custom Feeds
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
  const location = useLocation();

  // Expanded states for sections
  const [tradingExpanded, setTradingExpanded] = useState(true);
  const [wellnessExpanded, setWellnessExpanded] = useState(false);
  const [prosperityExpanded, setProsperityExpanded] = useState(false);
  const [earnExpanded, setEarnExpanded] = useState(false);
  const [customExpanded, setCustomExpanded] = useState(false);

  // Trending hashtags
  const [trendingHashtags, setTrendingHashtags] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(false);

  // Load trending hashtags on mount
  useEffect(() => {
    loadTrendingHashtags();
  }, []);

  const loadTrendingHashtags = async () => {
    setLoadingTrending(true);
    try {
      // Mock data - replace with actual API call
      setTrendingHashtags([
        { hashtag: 'bitcoin', count: 1234 },
        { hashtag: 'ethereum', count: 892 },
        { hashtag: 'trading', count: 756 },
        { hashtag: 'crystal', count: 543 },
        { hashtag: 'mindset', count: 421 }
      ]);
    } catch (error) {
      console.error('[LeftSidebar] Load trending error:', error);
    } finally {
      setLoadingTrending(false);
    }
  };

  const handleHashtagClick = (hashtag) => {
    navigate(`/forum/hashtag/${hashtag}`);
  };

  /**
   * Main Feed Types - Compact version
   */
  const mainFeeds = [
    { id: 'explore', label: 'Khám phá', icon: Sparkles },
    { id: 'following', label: 'Theo dõi', icon: Users },
    { id: 'news', label: 'Tin tức', icon: Newspaper }
  ];

  /**
   * Category Feeds - Compact version (no subtitles)
   */
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

  return (
    <aside className="left-sidebar">
      {/* Quick Actions - Compact */}
      <div className="quick-actions">
        <button
          className="quick-action-btn"
          onClick={() => onQuickAction?.('liked')}
        >
          <Heart size={14} className="quick-icon liked" />
          <span>Thích</span>
        </button>
        <button
          className="quick-action-btn"
          onClick={() => onQuickAction?.('saved')}
        >
          <Bookmark size={14} className="quick-icon saved" />
          <span>Lưu</span>
        </button>
      </div>

      {/* Main Feeds - Compact */}
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

      {/* Trending Hashtags - Compact */}
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
              trendingHashtags.slice(0, 3).map((item, index) => (
                <button
                  key={`trending-${index}`}
                  className="trending-item"
                  onClick={() => handleHashtagClick(item.hashtag)}
                >
                  <Hash size={12} className="trending-icon" />
                  <span className="hashtag-name">#{item.hashtag}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Custom Feeds - Compact */}
      {customFeeds.length > 0 && (
        <div className="feed-section">
          <button
            className="section-header"
            onClick={() => setCustomExpanded(!customExpanded)}
          >
            <Sparkles size={12} className="section-icon" />
            <span className="section-title">TÙY CHỈNH</span>
            <span className="section-chevron">
              {customExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </span>
          </button>

          {customExpanded && (
            <div className="section-items">
              {customFeeds.map((feed) => (
                <button
                  key={feed.id}
                  className={`feed-item ${selectedFeed === feed.id ? 'active' : ''}`}
                  onClick={() => onFeedChange?.(feed.id)}
                >
                  <Sparkles size={14} className="feed-icon" />
                  <span className="feed-item-title">{feed.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Feed - Compact */}
      <div className="feed-actions">
        <button
          className="feed-action-btn"
          onClick={onCreateFeed}
        >
          <Plus size={12} />
          <span>Tạo Feed</span>
        </button>
        {customFeeds.length > 0 && (
          <button
            className="feed-action-btn outline"
            onClick={onEditFeeds}
          >
            <Edit3 size={12} />
            <span>Quản Lý</span>
          </button>
        )}
      </div>
    </aside>
  );
}
