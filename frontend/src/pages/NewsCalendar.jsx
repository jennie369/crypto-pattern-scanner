import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import TierGuard from '../components/TierGuard/TierGuard';
import * as newsApi from '../services/newsApi';
// import './NewsCalendar.css'; // Commented out to use global styles from components.css

/**
 * NewsCalendar Page - TIER 2
 *
 * Crypto news and events calendar
 *
 * Features:
 * - Upcoming events list
 * - Event filtering (category, impact, date)
 * - Event search
 * - High-impact events highlight
 * - Calendar view by month
 * - Event cards with details
 *
 * Access: scanner_tier >= 'premium'
 */
export default function NewsCalendar() {
  const { user } = useAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedImpact, setSelectedImpact] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('list'); // list or timeline

  // Get categories and impact levels
  const categories = newsApi.getEventCategories();
  const impactLevels = newsApi.getImpactLevels();

  // Load events on mount
  useEffect(() => {
    if (user) {
      loadEvents();
    }
  }, [user]);

  // Apply filters when events or filters change
  useEffect(() => {
    applyFilters();
  }, [events, selectedCategory, selectedImpact, searchTerm]);

  const loadEvents = async () => {
    setLoading(true);

    try {
      const { data } = await newsApi.getUpcomingEvents();

      if (data) {
        setEvents(data);
      }

    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...events];

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(e => e.category === selectedCategory);
    }

    // Impact filter
    if (selectedImpact !== 'all') {
      filtered = filtered.filter(e => e.impact === selectedImpact);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(term) ||
        e.description.toLowerCase().includes(term) ||
        e.coin?.toLowerCase().includes(term)
      );
    }

    setFilteredEvents(filtered);
  };

  // Get time until event
  const getTimeUntil = (dateString) => {
    const eventDate = new Date(dateString);
    const now = new Date();
    const diff = eventDate - now;

    if (diff < 0) return 'Past';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days < 7) return `in ${days} days`;
    if (days < 30) return `in ${Math.floor(days / 7)} weeks`;
    if (days < 365) return `in ${Math.floor(days / 30)} months`;
    return `in ${Math.floor(days / 365)} years`;
  };

  // Group events by time period
  const groupedEvents = filteredEvents.reduce((acc, event) => {
    const timeUntil = getTimeUntil(event.date);
    let group = 'Later';

    if (timeUntil === 'Today' || timeUntil === 'Tomorrow') group = 'This Week';
    else if (timeUntil.includes('days') && parseInt(timeUntil) <= 7) group = 'This Week';
    else if (timeUntil.includes('days') || timeUntil.includes('weeks')) group = 'This Month';
    else if (timeUntil.includes('months')) group = 'Coming Soon';

    if (!acc[group]) acc[group] = [];
    acc[group].push(event);

    return acc;
  }, {});

  const groupOrder = ['This Week', 'This Month', 'Coming Soon', 'Later'];

  return (
    <TierGuard requiredTier="premium" featureName="News & Events Calendar">
      <div className="news-calendar-page">

        {/* Page Header */}
        <div className="news-header">
          <div className="header-content">
            <h1>📅 News & Events Calendar</h1>
            <p className="header-subtitle">Stay ahead with upcoming crypto events and news</p>
          </div>

          {/* View Toggle */}
          <div className="view-toggle">
            <button
              className={`btn-view ${view === 'list' ? 'active' : ''}`}
              onClick={() => setView('list')}
            >
              📋 List View
            </button>
            <button
              className={`btn-view ${view === 'timeline' ? 'active' : ''}`}
              onClick={() => setView('timeline')}
            >
              ⏱️ Timeline View
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">

          {/* Search Bar */}
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search events, coins..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            🔍
          </div>

          {/* Category Filter */}
          <div className="filter-group">
            <label>Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              {Object.keys(categories).map(key => (
                <option key={key} value={key}>
                  {categories[key].icon} {categories[key].label}
                </option>
              ))}
            </select>
          </div>

          {/* Impact Filter */}
          <div className="filter-group">
            <label>Impact:</label>
            <select
              value={selectedImpact}
              onChange={(e) => setSelectedImpact(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Impact Levels</option>
              {Object.keys(impactLevels).map(key => (
                <option key={key} value={key}>
                  {impactLevels[key].icon} {impactLevels[key].label}
                </option>
              ))}
            </select>
          </div>

          {/* Results Count */}
          <div className="results-count">
            {filteredEvents.length} events found
          </div>

        </div>

        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading events...</p>
          </div>
        )}

        {!loading && (
          <>

            {/* High Impact Events Banner */}
            {filteredEvents.filter(e => e.impact === 'high').length > 0 && (
              <div className="high-impact-banner">
                <div className="banner-icon">🔴</div>
                <div className="banner-content">
                  <div className="banner-title">
                    {filteredEvents.filter(e => e.impact === 'high').length} High-Impact Events Coming
                  </div>
                  <div className="banner-subtitle">
                    These events could significantly affect market prices
                  </div>
                </div>
              </div>
            )}

            {/* Events List View */}
            {view === 'list' && (
              <div className="events-list">
                {filteredEvents.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <p>No events found</p>
                    <small>Try adjusting your filters</small>
                  </div>
                ) : (
                  groupOrder.map(groupName => {
                    const groupEvents = groupedEvents[groupName];

                    if (!groupEvents || groupEvents.length === 0) return null;

                    return (
                      <div key={groupName} className="event-group">
                        <h2 className="group-title">{groupName}</h2>

                        <div className="event-cards">
                          {groupEvents.map(event => (
                            <div key={event.id} className={`event-card ${event.impact}`}>

                              {/* Event Header */}
                              <div className="event-header">
                                <div className="event-meta">
                                  <span className={`category-badge ${event.category.toLowerCase()}`}
                                        style={{ backgroundColor: categories[event.category]?.color + '20',
                                                 color: categories[event.category]?.color }}>
                                    {categories[event.category]?.icon} {categories[event.category]?.label}
                                  </span>

                                  <span className={`impact-badge ${event.impact}`}
                                        style={{ backgroundColor: impactLevels[event.impact]?.color + '20',
                                                 color: impactLevels[event.impact]?.color }}>
                                    {impactLevels[event.impact]?.icon} {event.impact.toUpperCase()}
                                  </span>
                                </div>

                                {event.coin && (
                                  <div className="coin-badge">{event.coin}</div>
                                )}
                              </div>

                              {/* Event Title & Description */}
                              <h3 className="event-title">{event.title}</h3>
                              <p className="event-description">{event.description}</p>

                              {/* Event Footer */}
                              <div className="event-footer">
                                <div className="event-date">
                                  📅 {new Date(event.date).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </div>

                                <div className="event-time-until">
                                  ⏱️ {getTimeUntil(event.date)}
                                </div>

                                <div className="event-source">
                                  📰 {event.source}
                                </div>
                              </div>

                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Timeline View */}
            {view === 'timeline' && (
              <div className="timeline-view">
                {filteredEvents.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <p>No events found</p>
                  </div>
                ) : (
                  <div className="timeline">
                    {filteredEvents.map((event, index) => (
                      <div key={event.id} className="timeline-item">
                        <div className="timeline-dot"
                             style={{ backgroundColor: impactLevels[event.impact]?.color }}></div>

                        <div className={`timeline-card ${event.impact}`}>
                          <div className="timeline-date">
                            {new Date(event.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>

                          <div className="timeline-content">
                            <div className="timeline-badges">
                              <span className="category-badge"
                                    style={{ backgroundColor: categories[event.category]?.color + '20',
                                             color: categories[event.category]?.color }}>
                                {categories[event.category]?.icon} {categories[event.category]?.label}
                              </span>
                              {event.coin && <span className="coin-badge">{event.coin}</span>}
                            </div>

                            <h3 className="timeline-title">{event.title}</h3>
                            <p className="timeline-description">{event.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </>
        )}

      </div>
    </TierGuard>
  );
}
