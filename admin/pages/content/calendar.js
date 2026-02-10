/**
 * Content Calendar Page
 * Plan and schedule content across different channels
 */

import React, { useState, useEffect, useCallback } from 'react';
import ConfirmModal from '../../components/common/ConfirmModal';
import * as contentService from '../../services/contentService';

const CONTENT_TYPES = [
  { value: 'push', label: 'Push Notification', color: 'amber' },
  { value: 'email', label: 'Email', color: 'blue' },
  { value: 'banner', label: 'Banner Update', color: 'purple' },
  { value: 'social', label: 'Social Post', color: 'pink' },
];

const EVENT_STATUSES = [
  { value: 'planned', label: 'Planned', color: 'gray' },
  { value: 'scheduled', label: 'Scheduled', color: 'blue' },
  { value: 'sent', label: 'Sent', color: 'green' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
];

export default function ContentCalendarPage() {
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'push',
    scheduled_date: '',
    scheduled_time: '09:00',
    status: 'planned',
  });

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const startDate = new Date(year, month, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

      const result = await contentService.getCalendarEvents({ startDate, endDate });

      if (result.success) {
        setEvents(result.data);
      } else {
        // Mock events
        setEvents([
          { id: 1, title: 'Weekly Newsletter', type: 'email', scheduled_date: getDateString(5), scheduled_time: '09:00', status: 'scheduled' },
          { id: 2, title: 'Pattern Alert Push', type: 'push', scheduled_date: getDateString(7), scheduled_time: '08:00', status: 'planned' },
          { id: 3, title: 'Flash Sale Announcement', type: 'push', scheduled_date: getDateString(10), scheduled_time: '10:00', status: 'scheduled' },
          { id: 4, title: 'Feature Spotlight', type: 'banner', scheduled_date: getDateString(12), scheduled_time: '00:00', status: 'planned' },
          { id: 5, title: 'Market Update', type: 'push', scheduled_date: getDateString(14), scheduled_time: '08:30', status: 'sent' },
          { id: 6, title: 'Course Launch', type: 'push', scheduled_date: getDateString(18), scheduled_time: '09:00', status: 'planned' },
          { id: 7, title: 'Social Campaign', type: 'social', scheduled_date: getDateString(20), scheduled_time: '12:00', status: 'planned' },
          { id: 8, title: 'End of Month Promo', type: 'push', scheduled_date: getDateString(28), scheduled_time: '10:00', status: 'scheduled' },
        ]);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const getDateString = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return date.toISOString().split('T')[0];
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, daysInPrevMonth - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Next month days
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(e => e.scheduled_date === dateStr);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      type: 'push',
      scheduled_date: date.toISOString().split('T')[0],
      scheduled_time: '09:00',
      status: 'planned',
    });
    setShowModal(true);
  };

  const handleEventClick = (event, e) => {
    e.stopPropagation();
    setEditingEvent(event);
    setFormData({
      title: event.title || '',
      description: event.description || '',
      type: event.type || 'push',
      scheduled_date: event.scheduled_date || '',
      scheduled_time: event.scheduled_time || '09:00',
      status: event.status || 'planned',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingEvent) {
        await contentService.updateCalendarEvent(editingEvent.id, formData);
      } else {
        await contentService.createCalendarEvent(formData);
      }
      setShowModal(false);
      loadEvents();
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleDelete = () => {
    if (editingEvent) {
      setDeletingId(editingEvent.id);
      setShowDeleteConfirm(true);
    }
  };

  const confirmDelete = async () => {
    try {
      await contentService.deleteCalendarEvent(deletingId);
      setShowDeleteConfirm(false);
      setShowModal(false);
      loadEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const getTypeConfig = (type) => {
    return CONTENT_TYPES.find(t => t.value === type) || CONTENT_TYPES[0];
  };

  const getStatusConfig = (status) => {
    return EVENT_STATUSES.find(s => s.value === status) || EVENT_STATUSES[0];
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const days = getDaysInMonth();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Content Calendar</h1>
          <p className="text-gray-400 mt-1">Plan and schedule your content</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-white font-medium min-w-[150px] text-center">
              {currentDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
          >
            Today
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center space-x-6">
        {CONTENT_TYPES.map((type) => (
          <div key={type.value} className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full bg-${type.color}-500`}></div>
            <span className="text-gray-400 text-sm">{type.label}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        {/* Week Days Header */}
        <div className="grid grid-cols-7 border-b border-gray-700">
          {weekDays.map((day) => (
            <div key={day} className="p-4 text-center text-gray-400 font-medium">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        {loading ? (
          <div className="h-[600px] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-7">
            {days.map((day, index) => {
              const dayEvents = getEventsForDate(day.date);
              const dayIsToday = isToday(day.date);
              return (
                <div
                  key={index}
                  onClick={() => handleDateClick(day.date)}
                  className={`min-h-[120px] p-2 border-b border-r border-gray-700 cursor-pointer transition-colors ${
                    day.isCurrentMonth ? 'bg-gray-800 hover:bg-gray-750' : 'bg-gray-850 hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`w-7 h-7 flex items-center justify-center rounded-full text-sm ${
                        dayIsToday
                          ? 'bg-amber-500 text-gray-900 font-bold'
                          : day.isCurrentMonth
                          ? 'text-white'
                          : 'text-gray-500'
                      }`}
                    >
                      {day.date.getDate()}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-xs text-gray-400">{dayEvents.length}</span>
                    )}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event) => {
                      const typeConfig = getTypeConfig(event.type);
                      return (
                        <div
                          key={event.id}
                          onClick={(e) => handleEventClick(event, e)}
                          className={`px-2 py-1 rounded text-xs truncate bg-${typeConfig.color}-500/20 text-${typeConfig.color}-400 hover:bg-${typeConfig.color}-500/30`}
                        >
                          {event.scheduled_time} {event.title}
                        </div>
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-gray-400 pl-2">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upcoming Events Sidebar */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Upcoming This Week</h3>
        <div className="space-y-3">
          {events
            .filter(e => {
              const eventDate = new Date(e.scheduled_date);
              const today = new Date();
              const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
              return eventDate >= today && eventDate <= nextWeek;
            })
            .sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date))
            .slice(0, 5)
            .map((event) => {
              const typeConfig = getTypeConfig(event.type);
              const statusConfig = getStatusConfig(event.status);
              return (
                <div
                  key={event.id}
                  onClick={(e) => handleEventClick(event, e)}
                  className="p-4 bg-gray-750 rounded-lg flex items-center justify-between cursor-pointer hover:bg-gray-700"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-lg bg-${typeConfig.color}-500/20 flex items-center justify-center`}>
                      <svg className={`w-5 h-5 text-${typeConfig.color}-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-medium">{event.title}</p>
                      <p className="text-gray-400 text-sm">
                        {new Date(event.scheduled_date).toLocaleDateString('vi-VN', { weekday: 'short', month: 'short', day: 'numeric' })} at {event.scheduled_time}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs bg-${statusConfig.color}-500/20 text-${statusConfig.color}-400`}>
                    {statusConfig.label}
                  </span>
                </div>
              );
            })}
          {events.filter(e => {
            const eventDate = new Date(e.scheduled_date);
            const today = new Date();
            const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
            return eventDate >= today && eventDate <= nextWeek;
          }).length === 0 && (
            <p className="text-gray-400 text-center py-4">No events scheduled this week</p>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-semibold text-white mb-6">
              {editingEvent ? 'Edit Event' : 'Schedule Content'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Event title"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  placeholder="Optional description"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Content Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {CONTENT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {EVENT_STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Date *</label>
                  <input
                    type="date"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Time</label>
                  <input
                    type="time"
                    value={formData.scheduled_time}
                    onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              {editingEvent && (
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30"
                >
                  Delete
                </button>
              )}
              <div className={`flex space-x-3 ${!editingEvent ? 'ml-auto' : ''}`}>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!formData.title || !formData.scheduled_date}
                  className="px-4 py-2 bg-amber-500 text-gray-900 rounded-lg hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingEvent ? 'Update' : 'Schedule'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Event"
        message="Are you sure you want to delete this calendar event? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
