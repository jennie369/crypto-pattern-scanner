/**
 * Events Service
 * Community events and calendar functionality
 */

import { supabase } from '../lib/supabaseClient';

class EventsService {
  /**
   * Get upcoming events
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} List of events
   */
  async getEvents(filters = {}) {
    try {
      let query = supabase
        .from('community_events')
        .select(`
          *,
          users:host_id(
            id,
            display_name,
            avatar_url
          ),
          event_rsvps(
            id,
            status,
            user_id
          )
        `)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true });

      // Apply filters
      if (filters.eventType) {
        query = query.eq('event_type', filters.eventType);
      }

      if (filters.requiredTier) {
        query = query.eq('required_tier', filters.requiredTier);
      }

      if (filters.isFeatured) {
        query = query.eq('is_featured', true);
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }

  /**
   * Get past events
   * @param {number} limit - Number of events to fetch
   * @returns {Promise<Array>} List of past events
   */
  async getPastEvents(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('community_events')
        .select(`
          *,
          users:host_id(
            id,
            display_name,
            avatar_url
          ),
          event_rsvps(
            id,
            status,
            user_id
          )
        `)
        .lt('end_time', new Date().toISOString())
        .order('start_time', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching past events:', error);
      throw error;
    }
  }

  /**
   * Get event by ID
   * @param {string} eventId - Event ID
   * @returns {Promise<Object>} Event details
   */
  async getEventById(eventId) {
    try {
      const { data, error } = await supabase
        .from('community_events')
        .select(`
          *,
          users:host_id(
            id,
            display_name,
            avatar_url,
            email
          ),
          event_rsvps(
            id,
            status,
            user_id,
            created_at,
            users:user_id(
              id,
              display_name,
              avatar_url
            )
          )
        `)
        .eq('id', eventId)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error;
    }
  }

  /**
   * Create a new event
   * @param {Object} eventData - Event data
   * @returns {Promise<Object>} Created event
   */
  async createEvent(eventData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error} = await supabase
        .from('community_events')
        .insert({
          title: eventData.title,
          description: eventData.description,
          event_type: eventData.eventType,
          start_time: eventData.startTime,
          end_time: eventData.endTime,
          location: eventData.location || null,
          is_online: eventData.isOnline !== undefined ? eventData.isOnline : true,
          max_participants: eventData.maxParticipants || 50,
          required_tier: eventData.requiredTier || 'free',
          host_id: user.id,
          is_featured: false, // Hidden in modal, default to false
          tags: eventData.tags || []
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  /**
   * Update an event
   * @param {string} eventId - Event ID
   * @param {Object} updates - Updated fields
   * @returns {Promise<Object>} Updated event
   */
  async updateEvent(eventId, updates) {
    try {
      const { data, error } = await supabase
        .from('community_events')
        .update(updates)
        .eq('id', eventId)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  /**
   * Delete an event
   * @param {string} eventId - Event ID
   * @returns {Promise<void>}
   */
  async deleteEvent(eventId) {
    try {
      const { error } = await supabase
        .from('community_events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  /**
   * RSVP to an event
   * @param {string} eventId - Event ID
   * @param {string} status - RSVP status ('going', 'maybe', 'not_going')
   * @returns {Promise<Object>} RSVP record
   */
  async rsvpToEvent(eventId, status = 'going') {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if RSVP already exists
      const { data: existing } = await supabase
        .from('event_rsvps')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single();

      if (existing) {
        // Update existing RSVP
        const { data, error } = await supabase
          .from('event_rsvps')
          .update({ status })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new RSVP
        const { data, error } = await supabase
          .from('event_rsvps')
          .insert({
            event_id: eventId,
            user_id: user.id,
            status
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('Error RSVPing to event:', error);
      throw error;
    }
  }

  /**
   * Cancel RSVP
   * @param {string} eventId - Event ID
   * @returns {Promise<void>}
   */
  async cancelRsvp(eventId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('event_rsvps')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error canceling RSVP:', error);
      throw error;
    }
  }

  /**
   * Get user's RSVPs
   * @returns {Promise<Array>} List of user's RSVPs with event details
   */
  async getUserRsvps() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('event_rsvps')
        .select(`
          *,
          community_events(
            *,
            users:host_id(
              id,
              display_name,
              avatar_url
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching user RSVPs:', error);
      throw error;
    }
  }

  /**
   * Get events hosted by user
   * @returns {Promise<Array>} List of events hosted by current user
   */
  async getHostedEvents() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('community_events')
        .select(`
          *,
          event_rsvps(
            id,
            status,
            user_id,
            users:user_id(
              id,
              display_name,
              avatar_url
            )
          )
        `)
        .eq('host_id', user.id)
        .order('start_time', { ascending: false });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching hosted events:', error);
      throw error;
    }
  }

  /**
   * Get event attendees (users with 'going' status)
   * @param {string} eventId - Event ID
   * @returns {Promise<Array>} List of attendees
   */
  async getEventAttendees(eventId) {
    try {
      const { data, error } = await supabase
        .from('event_rsvps')
        .select(`
          *,
          users:user_id(
            id,
            display_name,
            avatar_url,
            email
          )
        `)
        .eq('event_id', eventId)
        .eq('status', 'going');

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching event attendees:', error);
      throw error;
    }
  }

  /**
   * Subscribe to event updates
   * @param {string} eventId - Event ID
   * @param {Function} callback - Callback function when event changes
   * @returns {Object} Subscription object
   */
  subscribeToEvent(eventId, callback) {
    const channel = supabase
      .channel(`event:${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_events',
          filter: `id=eq.${eventId}`
        },
        (payload) => {
          callback(payload);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_rsvps',
          filter: `event_id=eq.${eventId}`
        },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();

    return channel;
  }

  /**
   * Check if event is full
   * @param {Object} event - Event object
   * @returns {boolean} True if event is at capacity
   */
  isEventFull(event) {
    if (!event.max_participants) return false;
    return event.current_participants >= event.max_participants;
  }

  /**
   * Check if user has access to event based on tier
   * @param {Object} event - Event object
   * @param {string} userTier - User's tier (TIER1, TIER2, TIER3)
   * @returns {boolean} True if user has access
   */
  hasEventAccess(event, userTier) {
    if (!event.required_tier) return true;

    const tierLevels = {
      'TIER1': 1,
      'TIER2': 2,
      'TIER3': 3
    };

    return tierLevels[userTier] >= tierLevels[event.required_tier];
  }
}

export default new EventsService();
