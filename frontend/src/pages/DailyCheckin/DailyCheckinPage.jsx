import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import './DailyCheckinPage.css';

const MILESTONES = [
  { days: 3, label: '3 ngày liên tiếp', reward: 5, icon: '🌟' },
  { days: 7, label: '7 ngày liên tiếp', reward: 15, icon: '🔥' },
  { days: 14, label: '14 ngày liên tiếp', reward: 30, icon: '💎' },
  { days: 30, label: '30 ngày liên tiếp', reward: 100, icon: '👑' },
  { days: 60, label: '60 ngày liên tiếp', reward: 250, icon: '🏆' },
  { days: 100, label: '100 ngày liên tiếp', reward: 500, icon: '⭐' },
];

const DAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function getMonthDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return { firstDay, daysInMonth };
}

export function DailyCheckinPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [streak, setStreak] = useState(0);
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [checkinDates, setCheckinDates] = useState(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [gemsEarned, setGemsEarned] = useState(0);

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const todayStr = today.toISOString().split('T')[0];

  const fetchCheckinStatus = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      // Try RPC first, fall back to direct query
      const { data: statusData, error: statusErr } = await supabase
        .rpc('get_checkin_status', { p_user_id: user.id });

      if (!statusErr && statusData) {
        setStreak(statusData.current_streak || 0);
        setCheckedInToday(!!statusData.checked_in_today);
      } else {
        // Fallback: query checkin_streaks directly
        const { data: streakData } = await supabase
          .from('checkin_streaks')
          .select('current_streak, last_checkin_date')
          .eq('user_id', user.id)
          .single();

        if (streakData) {
          setStreak(streakData.current_streak || 0);
          setCheckedInToday(streakData.last_checkin_date === todayStr);
        }
      }

      // Fetch this month's checkin dates
      const monthStart = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
      const monthEnd = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(new Date(currentYear, currentMonth + 1, 0).getDate()).padStart(2, '0')}`;

      const { data: checkins } = await supabase
        .from('daily_checkins')
        .select('checkin_date')
        .eq('user_id', user.id)
        .gte('checkin_date', monthStart)
        .lte('checkin_date', monthEnd);

      if (checkins) {
        setCheckinDates(new Set(checkins.map(c => c.checkin_date)));
      }
    } catch (err) {
      setError(err.message || 'Không thể tải dữ liệu điểm danh');
    } finally {
      setLoading(false);
    }
  }, [user, todayStr, currentYear, currentMonth]);

  useEffect(() => {
    if (user) {
      fetchCheckinStatus();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading, fetchCheckinStatus]);

  const handleCheckin = async () => {
    if (!user || checkedInToday || submitting) return;
    setSubmitting(true);

    try {
      const { data, error: rpcErr } = await supabase
        .rpc('perform_daily_checkin', { p_user_id: user.id });

      if (rpcErr) {
        // Check if already checked in
        if (rpcErr.message?.includes('already') || rpcErr.code === '23505') {
          setCheckedInToday(true);
          return;
        }
        throw rpcErr;
      }

      const earned = data?.gems_earned || 1;
      setGemsEarned(earned);
      setCheckedInToday(true);
      setStreak(prev => prev + 1);
      setCheckinDates(prev => new Set([...prev, todayStr]));
      setShowSuccess(true);

      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Điểm danh thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  // Auth wall
  if (!authLoading && !user) {
    return (
      <div className="checkin-page">
        <div className="checkin-page__auth">
          <div className="checkin-page__auth-icon">🔒</div>
          <p className="checkin-page__auth-text">Đăng nhập để điểm danh hàng ngày</p>
          <button className="checkin-page__auth-btn" onClick={() => navigate('/login')}>
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="checkin-page">
        <div className="checkin-page__loading">
          <div className="checkin-page__loading-spinner" />
          <span className="checkin-page__loading-text">Đang tải...</span>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="checkin-page">
        <div className="checkin-page__error">
          <div className="checkin-page__error-icon">⚠️</div>
          <p className="checkin-page__error-text">{error}</p>
          <button className="checkin-page__retry-btn" onClick={fetchCheckinStatus}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // Calendar rendering
  const { firstDay, daysInMonth } = getMonthDays(currentYear, currentMonth);
  const calendarCells = [];
  for (let i = 0; i < firstDay; i++) {
    calendarCells.push(<div key={`empty-${i}`} className="checkin-calendar__day checkin-calendar__day--empty" />);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isChecked = checkinDates.has(dateStr);
    const isToday = dateStr === todayStr;
    const isFuture = new Date(dateStr) > today;

    let cls = 'checkin-calendar__day';
    if (isChecked) cls += ' checkin-calendar__day--checked';
    if (isToday) cls += ' checkin-calendar__day--today';
    if (isFuture) cls += ' checkin-calendar__day--future';

    calendarCells.push(
      <div key={dateStr} className={cls}>
        {d}
      </div>
    );
  }

  return (
    <div className="checkin-page">
      <header className="checkin-page__header">
        <h1 className="checkin-page__title">Điểm Danh</h1>
        <p className="checkin-page__subtitle">Nhận Gems mỗi ngày khi điểm danh</p>
      </header>

      {/* Streak Card */}
      <div className="checkin-streak-card">
        <div className="checkin-streak-card__flame">{streak >= 7 ? '🔥' : '✨'}</div>
        <p className="checkin-streak-card__count">{streak}</p>
        <p className="checkin-streak-card__label">ngày liên tiếp</p>
      </div>

      {/* Success Animation */}
      {showSuccess && (
        <div className="checkin-success">
          <div className="checkin-success__icon">🎉</div>
          <p className="checkin-success__text">Điểm danh thành công!</p>
          <p className="checkin-success__gems">+{gemsEarned} Gems</p>
        </div>
      )}

      {/* Checkin Button */}
      <button
        className={`checkin-btn ${
          submitting ? 'checkin-btn--loading' :
          checkedInToday ? 'checkin-btn--done' :
          'checkin-btn--active'
        }`}
        onClick={handleCheckin}
        disabled={checkedInToday || submitting}
      >
        {submitting ? (
          <>
            <div className="checkin-btn__spinner" />
            Đang xử lý...
          </>
        ) : checkedInToday ? (
          '✅ Đã điểm danh hôm nay'
        ) : (
          '📅 Điểm danh ngay'
        )}
      </button>

      {/* Calendar */}
      <div className="checkin-calendar">
        <h3 className="checkin-calendar__title">
          Tháng {currentMonth + 1}/{currentYear}
        </h3>
        <div className="checkin-calendar__grid">
          {DAY_LABELS.map(d => (
            <div key={d} className="checkin-calendar__day-label">{d}</div>
          ))}
          {calendarCells}
        </div>
      </div>

      {/* Milestones */}
      <div className="checkin-milestones">
        <h3 className="checkin-milestones__title">Mốc thưởng</h3>
        {MILESTONES.map(m => {
          const reached = streak >= m.days;
          const progress = Math.min(streak / m.days, 1);
          return (
            <div key={m.days} className="checkin-milestone">
              <div className={`checkin-milestone__icon ${reached ? 'checkin-milestone__icon--reached' : 'checkin-milestone__icon--pending'}`}>
                {m.icon}
              </div>
              <div className="checkin-milestone__info">
                <p className="checkin-milestone__name">{m.label}</p>
                <p className="checkin-milestone__desc">+{m.reward} Gems</p>
                {!reached && (
                  <div className="checkin-milestone__progress">
                    <div
                      className="checkin-milestone__progress-fill"
                      style={{ width: `${progress * 100}%` }}
                    />
                  </div>
                )}
              </div>
              <span className={`checkin-milestone__status ${reached ? 'checkin-milestone__status--reached' : 'checkin-milestone__status--pending'}`}>
                {reached ? '✓ Đạt' : `${streak}/${m.days}`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DailyCheckinPage;
