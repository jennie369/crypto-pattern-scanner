import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Clock, Plus, X, Filter, TrendingUp, Video, BookOpen, MessageSquare, Tag } from 'lucide-react';
import { toast } from 'react-toastify';
import eventsService from '../../services/events';
import { useAuth } from '../../contexts/AuthContext';
import './Events.css';

// =====================================================
// EVENT CREATE MODAL COMPONENT
// =====================================================
const EventCreateModal = ({ isOpen, onClose, onEventCreated }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventType: 'webinar',
    startTime: '',
    endTime: '',
    location: '',
    maxParticipants: 50,
    requiredTier: 'free',
    isOnline: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate times
      const startTime = new Date(formData.startTime);
      const endTime = new Date(formData.endTime);
      const now = new Date();

      if (startTime < now) {
        throw new Error('Thời gian bắt đầu phải sau thời điểm hiện tại');
      }

      if (endTime <= startTime) {
        throw new Error('Thời gian kết thúc phải sau thời gian bắt đầu');
      }

      // Create event
      const data = await eventsService.createEvent({
        title: formData.title,
        description: formData.description,
        eventType: formData.eventType,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        location: formData.location || null,
        maxParticipants: parseInt(formData.maxParticipants),
        requiredTier: formData.requiredTier,
        isOnline: formData.isOnline
      });

      toast.success('Sự kiện đã được tạo thành công!');

      if (onEventCreated) {
        onEventCreated(data);
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        eventType: 'webinar',
        startTime: '',
        endTime: '',
        location: '',
        maxParticipants: 50,
        requiredTier: 'free',
        isOnline: true
      });

      onClose();

    } catch (err) {
      console.error('Event creation error:', err);
      const errorMessage = err.message || 'Có lỗi xảy ra khi tạo sự kiện';
      setError(errorMessage);
      toast.error('Lỗi: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content event-create-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>Tạo Sự Kiện Mới</h2>
          <button className="modal-close" onClick={onClose} type="button">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="event-create-form">

          {/* Title */}
          <div className="form-group">
            <label htmlFor="title">
              <Tag size={16} />
              Tiêu Đề Sự Kiện *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="VD: Workshop Trading Pattern"
              required
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">Mô Tả *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Nội dung chi tiết về sự kiện..."
              rows={4}
              required
            />
          </div>

          {/* Event Type */}
          <div className="form-group">
            <label htmlFor="eventType">Loại Sự Kiện *</label>
            <select
              id="eventType"
              name="eventType"
              value={formData.eventType}
              onChange={handleChange}
              required
            >
              <option value="webinar">🎥 Webinar Online</option>
              <option value="workshop">🛠️ Workshop</option>
              <option value="trading_session">📈 Trading Session</option>
              <option value="meetup">🤝 Meetup Offline</option>
            </select>
          </div>

          {/* Time Range */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startTime">
                <Calendar size={16} />
                Thời Gian Bắt Đầu *
              </label>
              <input
                id="startTime"
                name="startTime"
                type="datetime-local"
                value={formData.startTime}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="endTime">
                <Calendar size={16} />
                Thời Gian Kết Thúc *
              </label>
              <input
                id="endTime"
                name="endTime"
                type="datetime-local"
                value={formData.endTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Is Online Checkbox */}
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="isOnline"
                checked={formData.isOnline}
                onChange={handleChange}
              />
              <span>🌐 Sự kiện trực tuyến (Online)</span>
            </label>
          </div>

          {/* Location & Capacity */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="location">
                <MapPin size={16} />
                Địa Điểm {formData.isOnline ? '(Link Zoom)' : '(Địa chỉ)'}
              </label>
              <input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                placeholder={formData.isOnline ? "https://zoom.us/j/..." : "123 Đường ABC, Quận 1, TP.HCM"}
              />
            </div>
            <div className="form-group">
              <label htmlFor="maxParticipants">
                <Users size={16} />
                Số Người Tối Đa
              </label>
              <input
                id="maxParticipants"
                name="maxParticipants"
                type="number"
                value={formData.maxParticipants}
                onChange={handleChange}
                min="1"
                max="1000"
                required
              />
            </div>
          </div>

          {/* Tier Requirement */}
          <div className="form-group">
            <label htmlFor="requiredTier">Yêu Cầu Tier</label>
            <select
              id="requiredTier"
              name="requiredTier"
              value={formData.requiredTier}
              onChange={handleChange}
            >
              <option value="free">🆓 FREE (Tất cả)</option>
              <option value="basic">🔹 TIER 1 (Basic+)</option>
              <option value="premium">💎 TIER 2 (Premium+)</option>
              <option value="vip">👑 TIER 3 (VIP only)</option>
            </select>
          </div>

          {/* Error Display */}
          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          {/* Actions */}
          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Đang Tạo...' : 'Tạo Sự Kiện'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// =====================================================
// MAIN EVENTS PAGE COMPONENT
// =====================================================
export default function Events() {
  const { user, profile } = useAuth();
  const [events, setEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [myRsvps, setMyRsvps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // upcoming, past, my-events
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filters, setFilters] = useState({
    eventType: '',
    requiredTier: ''
  });

  useEffect(() => {
    loadEvents();
    loadMyRsvps();
  }, [filters]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const [upcomingData, pastData] = await Promise.all([
        eventsService.getEvents(filters),
        eventsService.getPastEvents(5)
      ]);
      setEvents(upcomingData);
      setPastEvents(pastData);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMyRsvps = async () => {
    try {
      const data = await eventsService.getUserRsvps();
      setMyRsvps(data);
    } catch (error) {
      console.error('Error loading RSVPs:', error);
    }
  };

  const handleRsvp = async (eventId, status) => {
    try {
      await eventsService.rsvpToEvent(eventId, status);
      await loadEvents();
      await loadMyRsvps();
    } catch (error) {
      console.error('Error RSVPing:', error);
      alert('Failed to RSVP');
    }
  };

  const handleCancelRsvp = async (eventId) => {
    try {
      await eventsService.cancelRsvp(eventId);
      await loadEvents();
      await loadMyRsvps();
    } catch (error) {
      console.error('Error canceling RSVP:', error);
    }
  };

  const handleEventCreated = (newEvent) => {
    // Add new event to the beginning of the events list
    setEvents(prev => [newEvent, ...prev]);
    // Reload to get updated data
    loadEvents();
  };

  const getUserRsvpStatus = (eventId) => {
    const rsvp = myRsvps.find(r => r.community_events.id === eventId);
    return rsvp?.status;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'webinar':
        return <Video size={20} />;
      case 'workshop':
        return <BookOpen size={20} />;
      case 'trading_session':
        return <TrendingUp size={20} />;
      case 'meetup':
        return <MessageSquare size={20} />;
      default:
        return <Calendar size={20} />;
    }
  };

  const getEventTypeLabel = (type) => {
    switch (type) {
      case 'webinar':
        return 'Webinar';
      case 'workshop':
        return 'Workshop';
      case 'trading_session':
        return 'Trading Session';
      case 'meetup':
        return 'Meetup';
      default:
        return type;
    }
  };

  const getTierBadgeColor = (tier) => {
    switch (tier) {
      case 'TIER1':
        return '#00D9FF';
      case 'TIER2':
        return '#FFBD59';
      case 'TIER3':
        return '#FF6B9D';
      default:
        return '#7B68EE';
    }
  };

  const renderEventCard = (event) => {
    const rsvpStatus = getUserRsvpStatus(event.id);
    const isFull = eventsService.isEventFull(event);
    const hasAccess = eventsService.hasEventAccess(event, profile?.scanner_tier || 'TIER1');

    return (
      <div key={event.id} className="event-card" onClick={() => setSelectedEvent(event)}>
        {event.is_featured && <div className="featured-badge"><TrendingUp size={16} style={{ marginRight: '6px' }} /> Featured</div>}

        <div className="event-image" style={{
          backgroundImage: event.image_url ? `url(${event.image_url})` : 'linear-gradient(135deg, #00D9FF 0%, #7B68EE 100%)'
        }}>
          <div className="event-type-badge">
            {getEventTypeIcon(event.event_type)}
            {getEventTypeLabel(event.event_type)}
          </div>
        </div>

        <div className="event-content">
          <div className="event-header">
            <h3>{event.title}</h3>
            {event.required_tier && (
              <span className="tier-badge" style={{ background: getTierBadgeColor(event.required_tier) }}>
                {event.required_tier}
              </span>
            )}
          </div>

          <p className="event-description">{event.description}</p>

          <div className="event-meta">
            <div className="event-meta-item">
              <Calendar size={16} />
              <span>{formatDate(event.start_time)}</span>
            </div>
            <div className="event-meta-item">
              <Clock size={16} />
              <span>{formatTime(event.start_time)} - {formatTime(event.end_time)}</span>
            </div>
            <div className="event-meta-item">
              <MapPin size={16} />
              <span>{event.is_online ? 'Online' : event.location}</span>
            </div>
            <div className="event-meta-item">
              <Users size={16} />
              <span>
                {event.current_participants}
                {event.max_participants ? ` / ${event.max_participants}` : ''} attending
              </span>
            </div>
          </div>

          <div className="event-actions">
            {!hasAccess ? (
              <button className="btn-disabled" disabled>
                Requires {event.required_tier}
              </button>
            ) : isFull ? (
              <button className="btn-disabled" disabled>
                Event Full
              </button>
            ) : rsvpStatus === 'going' ? (
              <button className="btn-rsvp active" onClick={(e) => {
                e.stopPropagation();
                handleCancelRsvp(event.id);
              }}>
                ✓ Going
              </button>
            ) : (
              <button className="btn-rsvp" onClick={(e) => {
                e.stopPropagation();
                handleRsvp(event.id, 'going');
              }}>
                RSVP
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="events-page">
      <div className="events-container">
        {/* Header */}
        <div className="events-header">
          <div className="header-content">
            <h1><Calendar size={32} /> Community Events</h1>
            <p>Join webinars, workshops, and trading sessions with the community</p>
          </div>
          <button className="btn-create-event" onClick={() => setShowCreateModal(true)}>
            <Plus size={20} /> Create Event
          </button>
        </div>

        {/* Tabs */}
        <div className="events-tabs">
          <button
            className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming Events ({events.length})
          </button>
          <button
            className={`tab ${activeTab === 'my-events' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-events')}
          >
            My Events ({myRsvps.filter(r => r.status === 'going').length})
          </button>
          <button
            className={`tab ${activeTab === 'past' ? 'active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            Past Events
          </button>
        </div>

        {/* Filters */}
        <div className="events-filters">
          <div className="filter-group">
            <Filter size={18} />
            <select
              value={filters.eventType}
              onChange={(e) => setFilters({ ...filters, eventType: e.target.value })}
            >
              <option value="">All Types</option>
              <option value="webinar">Webinar</option>
              <option value="workshop">Workshop</option>
              <option value="trading_session">Trading Session</option>
              <option value="meetup">Meetup</option>
            </select>
          </div>
          <div className="filter-group">
            <select
              value={filters.requiredTier}
              onChange={(e) => setFilters({ ...filters, requiredTier: e.target.value })}
            >
              <option value="">All Tiers</option>
              <option value="TIER1">Tier 1</option>
              <option value="TIER2">Tier 2</option>
              <option value="TIER3">Tier 3</option>
            </select>
          </div>
        </div>

        {/* Events Grid */}
        <div className="events-grid">
          {loading ? (
            <div className="loading-state">Loading events...</div>
          ) : activeTab === 'upcoming' ? (
            events.length === 0 ? (
              <div className="empty-state">
                <Calendar size={64} />
                <h3>No upcoming events</h3>
                <p>Check back later or create your own event!</p>
              </div>
            ) : (
              events.map(event => renderEventCard(event))
            )
          ) : activeTab === 'my-events' ? (
            myRsvps.filter(r => r.status === 'going').length === 0 ? (
              <div className="empty-state">
                <Users size={64} />
                <h3>No RSVPs yet</h3>
                <p>RSVP to events you want to attend</p>
              </div>
            ) : (
              myRsvps
                .filter(r => r.status === 'going')
                .map(rsvp => renderEventCard(rsvp.community_events))
            )
          ) : (
            pastEvents.length === 0 ? (
              <div className="empty-state">
                <Clock size={64} />
                <h3>No past events</h3>
              </div>
            ) : (
              pastEvents.map(event => renderEventCard(event))
            )
          )}
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="modal event-detail-modal" onClick={(e) => e.stopPropagation()}>
            <button className="btn-close-modal" onClick={() => setSelectedEvent(null)}>
              <X size={24} />
            </button>

            <div className="event-detail-image" style={{
              backgroundImage: selectedEvent.image_url ? `url(${selectedEvent.image_url})` : 'linear-gradient(135deg, #00D9FF 0%, #7B68EE 100%)'
            }}>
              {selectedEvent.is_featured && <div className="featured-badge"><TrendingUp size={16} style={{ marginRight: '6px' }} /> Featured</div>}
            </div>

            <div className="event-detail-content">
              <div className="event-detail-header">
                <h2>{selectedEvent.title}</h2>
                {selectedEvent.required_tier && (
                  <span className="tier-badge" style={{ background: getTierBadgeColor(selectedEvent.required_tier) }}>
                    {selectedEvent.required_tier}
                  </span>
                )}
              </div>

              <div className="event-type-label">
                {getEventTypeIcon(selectedEvent.event_type)}
                {getEventTypeLabel(selectedEvent.event_type)}
              </div>

              <p className="event-detail-description">{selectedEvent.description}</p>

              <div className="event-detail-meta">
                <div className="meta-item">
                  <Calendar size={20} />
                  <div>
                    <strong>Date</strong>
                    <span>{formatDate(selectedEvent.start_time)}</span>
                  </div>
                </div>
                <div className="meta-item">
                  <Clock size={20} />
                  <div>
                    <strong>Time</strong>
                    <span>{formatTime(selectedEvent.start_time)} - {formatTime(selectedEvent.end_time)}</span>
                  </div>
                </div>
                <div className="meta-item">
                  <MapPin size={20} />
                  <div>
                    <strong>Location</strong>
                    <span>{selectedEvent.is_online ? 'Online Event' : selectedEvent.location}</span>
                  </div>
                </div>
                <div className="meta-item">
                  <Users size={20} />
                  <div>
                    <strong>Attendees</strong>
                    <span>
                      {selectedEvent.current_participants}
                      {selectedEvent.max_participants ? ` / ${selectedEvent.max_participants}` : ''}
                    </span>
                  </div>
                </div>
              </div>

              <div className="event-detail-actions">
                {getUserRsvpStatus(selectedEvent.id) === 'going' ? (
                  <button className="btn-rsvp-large active" onClick={() => {
                    handleCancelRsvp(selectedEvent.id);
                    setSelectedEvent(null);
                  }}>
                    ✓ You're Going
                  </button>
                ) : (
                  <button className="btn-rsvp-large" onClick={() => {
                    handleRsvp(selectedEvent.id, 'going');
                    setSelectedEvent(null);
                  }}>
                    RSVP to Event
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      <EventCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onEventCreated={handleEventCreated}
      />
    </div>
  );
}
