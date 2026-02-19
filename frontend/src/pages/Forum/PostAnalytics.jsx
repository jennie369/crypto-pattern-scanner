import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import {
  ArrowLeft, Eye, Heart, MessageCircle, Share2,
  Loader2, AlertCircle, BarChart3, Users
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import './PostAnalytics.css';

const REACTION_COLORS = {
  like: '#FF6B6B',
  love: '#FF1493',
  haha: '#FFD93D',
  wow: '#00D9FF',
  sad: '#8B5CF6',
  angry: '#FF4500'
};

const REACTION_LABELS = {
  like: 'Thích',
  love: 'Yêu thích',
  haha: 'Haha',
  wow: 'Wow',
  sad: 'Buồn',
  angry: 'Phẫn nộ'
};

/**
 * PostAnalytics Page — Post performance dashboard
 * Route: /forum/post/:postId/analytics
 * Protected: only post author or admin
 */
export default function PostAnalytics() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [post, setPost] = useState(null);
  const [viewsData, setViewsData] = useState([]);
  const [reactions, setReactions] = useState([]);
  const [topCommenters, setTopCommenters] = useState([]);
  const [metrics, setMetrics] = useState({
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    totalShares: 0
  });

  useEffect(() => {
    if (postId) loadAnalytics();
  }, [postId]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load post
      const { data: postData, error: postError } = await supabase
        .from('forum_posts')
        .select(`*, author:profiles(id, full_name, avatar_url)`)
        .eq('id', postId)
        .single();

      if (postError) throw postError;
      if (!postData) {
        setError('Bài viết không tồn tại');
        return;
      }

      // Auth check
      if (postData.user_id !== user?.id && !isAdmin?.()) {
        setError('Bạn không có quyền xem phân tích bài viết này');
        return;
      }

      setPost(postData);

      // Load analytics data in parallel
      const [viewsRes, reactionsRes, commentsRes] = await Promise.all([
        supabase
          .from('post_views')
          .select('created_at')
          .eq('post_id', postId)
          .order('created_at', { ascending: true }),
        supabase
          .from('post_reactions')
          .select('reaction_type')
          .eq('post_id', postId),
        supabase
          .from('forum_comments')
          .select('user_id, author:profiles(full_name, avatar_url)')
          .eq('post_id', postId)
      ]);

      // Metrics
      setMetrics({
        totalViews: postData.views_count || viewsRes.data?.length || 0,
        totalLikes: postData.likes_count || 0,
        totalComments: postData.comments_count || commentsRes.data?.length || 0,
        totalShares: postData.shares_count || 0
      });

      // Views over time (group by day)
      const viewsByDay = {};
      (viewsRes.data || []).forEach(v => {
        const day = new Date(v.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
        viewsByDay[day] = (viewsByDay[day] || 0) + 1;
      });
      setViewsData(Object.entries(viewsByDay).map(([date, count]) => ({ date, views: count })));

      // Reactions breakdown
      const reactionCounts = {};
      (reactionsRes.data || []).forEach(r => {
        reactionCounts[r.reaction_type] = (reactionCounts[r.reaction_type] || 0) + 1;
      });
      setReactions(
        Object.entries(reactionCounts).map(([type, count]) => ({
          name: REACTION_LABELS[type] || type,
          value: count,
          color: REACTION_COLORS[type] || '#999'
        }))
      );

      // Top commenters
      const commenterMap = {};
      (commentsRes.data || []).forEach(c => {
        const uid = c.user_id;
        if (!commenterMap[uid]) {
          commenterMap[uid] = {
            name: c.author?.full_name || 'Ẩn danh',
            avatar: c.author?.avatar_url,
            count: 0
          };
        }
        commenterMap[uid].count++;
      });
      setTopCommenters(
        Object.values(commenterMap)
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
      );

    } catch (err) {
      console.error('[PostAnalytics] Load error:', err);
      setError('Không thể tải phân tích. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (n) => {
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  };

  // Loading
  if (loading) {
    return (
      <div className="analytics-page">
        <div className="analytics-loading">
          <Loader2 size={40} className="spinner-icon" />
          <p>Đang tải phân tích...</p>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="analytics-page">
        <div className="analytics-error">
          <AlertCircle size={48} />
          <p>{error}</p>
          <button className="btn-back" onClick={() => navigate('/forum')}>
            <ArrowLeft size={18} /> Quay lại Forum
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      {/* Header */}
      <div className="analytics-header">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          <span>Quay lại</span>
        </button>
        <h1 className="analytics-title">
          <BarChart3 size={24} />
          Phân tích bài viết
        </h1>
      </div>

      {/* Post Preview */}
      {post && (
        <div
          className="analytics-post-preview"
          onClick={() => navigate(`/forum/thread/${postId}`)}
        >
          <h3>{post.title || 'Bài viết'}</h3>
          <p>{(post.content || '').substring(0, 120)}...</p>
        </div>
      )}

      {/* Metric Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <Eye size={24} className="metric-icon views" />
          <span className="metric-value">{formatNumber(metrics.totalViews)}</span>
          <span className="metric-label">Lượt xem</span>
        </div>
        <div className="metric-card">
          <Heart size={24} className="metric-icon likes" />
          <span className="metric-value">{formatNumber(metrics.totalLikes)}</span>
          <span className="metric-label">Lượt thích</span>
        </div>
        <div className="metric-card">
          <MessageCircle size={24} className="metric-icon comments" />
          <span className="metric-value">{formatNumber(metrics.totalComments)}</span>
          <span className="metric-label">Bình luận</span>
        </div>
        <div className="metric-card">
          <Share2 size={24} className="metric-icon shares" />
          <span className="metric-value">{formatNumber(metrics.totalShares)}</span>
          <span className="metric-label">Chia sẻ</span>
        </div>
      </div>

      {/* Reactions Breakdown */}
      {reactions.length > 0 && (
        <div className="analytics-card">
          <h3 className="card-title">Phản ứng</h3>
          <div className="reactions-chart-wrapper">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={reactions}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {reactions.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Views Over Time */}
      {viewsData.length > 1 && (
        <div className="analytics-card">
          <h3 className="card-title">Lượt xem theo ngày</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={viewsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" fontSize={12} />
              <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(10,14,39,0.95)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Line
                type="monotone"
                dataKey="views"
                stroke="#FFBD59"
                strokeWidth={2}
                dot={{ fill: '#FFBD59', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Commenters */}
      {topCommenters.length > 0 && (
        <div className="analytics-card">
          <h3 className="card-title">
            <Users size={18} />
            Bình luận nhiều nhất
          </h3>
          <div className="top-commenters">
            {topCommenters.map((c, i) => (
              <div key={i} className="commenter-row">
                <span className="commenter-rank">{i + 1}</span>
                <div className="commenter-avatar">
                  {c.avatar ? (
                    <img src={c.avatar} alt={c.name} />
                  ) : (
                    <div className="avatar-placeholder">{c.name.charAt(0).toUpperCase()}</div>
                  )}
                </div>
                <span className="commenter-name">{c.name}</span>
                <span className="commenter-count">{c.count} bình luận</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
