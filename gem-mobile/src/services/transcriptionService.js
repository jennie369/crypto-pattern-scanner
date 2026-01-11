/**
 * Transcription Service
 * Handles voice-to-text transcription using Gemini AI
 *
 * Features:
 * - Auto-transcribe voice messages
 * - Vietnamese and English support
 * - Status tracking (pending, processing, completed, failed)
 * - Retry mechanism for failed transcriptions
 */

import { supabase } from './supabase';

const EDGE_FUNCTION = 'transcribe-voice';
const MIN_DURATION_MS = 1000; // 1 second minimum
const MAX_DURATION_MS = 300000; // 5 minutes maximum

/**
 * Request transcription for a voice message
 * @param {string} messageId - Message ID
 * @param {string} audioUrl - URL of the audio file
 * @param {number} durationMs - Duration in milliseconds
 * @param {string} language - Language code (vi, en)
 * @returns {Promise<{success: boolean, transcription?: string, error?: string}>}
 */
export const requestTranscription = async (
  messageId,
  audioUrl,
  durationMs,
  language = 'vi'
) => {
  try {
    // Validate duration
    if (durationMs < MIN_DURATION_MS) {
      console.log('[Transcription] Audio too short, skipping');
      await updateTranscriptionStatus(messageId, 'skipped');
      return { success: false, error: 'Audio quá ngắn (< 1 giây)' };
    }

    if (durationMs > MAX_DURATION_MS) {
      console.log('[Transcription] Audio too long');
      return { success: false, error: 'Audio quá dài (> 5 phút)' };
    }

    // Update status to processing
    await updateTranscriptionStatus(messageId, 'processing');

    // Call Edge Function
    const { data, error } = await supabase.functions.invoke(EDGE_FUNCTION, {
      body: {
        messageId,
        audioUrl,
        language,
      },
    });

    if (error) {
      console.error('[Transcription] Edge function error:', error);
      await updateTranscriptionStatus(messageId, 'failed', null, error.message);
      return { success: false, error: error.message };
    }

    if (!data?.success) {
      const errorMsg = data?.error || 'Transcription failed';
      await updateTranscriptionStatus(messageId, 'failed', null, errorMsg);
      return { success: false, error: errorMsg };
    }

    return { success: true, transcription: data.transcription };
  } catch (err) {
    console.error('[Transcription] requestTranscription error:', err);
    await updateTranscriptionStatus(messageId, 'failed', null, err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Update transcription status in database
 * @param {string} messageId
 * @param {string} status - pending, processing, completed, failed, skipped
 * @param {string} transcription - Transcription text (optional)
 * @param {string} errorMsg - Error message (optional)
 */
const updateTranscriptionStatus = async (
  messageId,
  status,
  transcription = null,
  errorMsg = null
) => {
  try {
    const { error } = await supabase.rpc('update_transcription_status', {
      p_message_id: messageId,
      p_status: status,
      p_transcription: transcription,
      p_error: errorMsg,
    });

    if (error) {
      console.error('[Transcription] updateStatus RPC error:', error);
      // Fallback to direct update
      await supabase
        .from('voice_message_metadata')
        .update({
          transcription_status: status,
          transcription: transcription || undefined,
          transcription_error: errorMsg || undefined,
          updated_at: new Date().toISOString(),
        })
        .eq('message_id', messageId);
    }
  } catch (err) {
    console.error('[Transcription] updateStatus error:', err);
  }
};

/**
 * Retry failed transcription
 * @param {string} messageId
 * @returns {Promise<{success: boolean, transcription?: string, error?: string}>}
 */
export const retryTranscription = async (messageId) => {
  try {
    // Get message details
    const { data: metadata, error } = await supabase
      .from('voice_message_metadata')
      .select(`
        duration_ms,
        transcription_language,
        message:message_id(attachment_url)
      `)
      .eq('message_id', messageId)
      .single();

    if (error || !metadata) {
      throw new Error('Không tìm thấy metadata');
    }

    const audioUrl = metadata.message?.attachment_url;
    if (!audioUrl) {
      throw new Error('Không tìm thấy audio URL');
    }

    return await requestTranscription(
      messageId,
      audioUrl,
      metadata.duration_ms || 5000,
      metadata.transcription_language || 'vi'
    );
  } catch (err) {
    console.error('[Transcription] retryTranscription error:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Get transcription for a message
 * @param {string} messageId
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const getTranscription = async (messageId) => {
  try {
    const { data, error } = await supabase
      .from('voice_message_metadata')
      .select('transcription, transcription_status, transcription_language, transcription_error')
      .eq('message_id', messageId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return {
      success: true,
      data: {
        transcription: data?.transcription || null,
        status: data?.transcription_status || 'pending',
        language: data?.transcription_language || 'vi',
        error: data?.transcription_error || null,
      },
    };
  } catch (err) {
    console.error('[Transcription] getTranscription error:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Save voice message metadata
 * @param {string} messageId
 * @param {number} durationMs
 * @param {array} waveform
 * @param {string} language
 */
export const saveVoiceMetadata = async (
  messageId,
  durationMs,
  waveform = [],
  language = 'vi'
) => {
  try {
    const { error } = await supabase.rpc('upsert_voice_metadata', {
      p_message_id: messageId,
      p_duration_ms: durationMs,
      p_waveform: waveform,
      p_language: language,
    });

    if (error) {
      console.error('[Transcription] saveVoiceMetadata RPC error:', error);
      // Fallback to direct upsert
      await supabase
        .from('voice_message_metadata')
        .upsert({
          message_id: messageId,
          duration_ms: durationMs,
          waveform: waveform,
          transcription_language: language,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'message_id',
        });
    }

    return { success: true };
  } catch (err) {
    console.error('[Transcription] saveVoiceMetadata error:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Subscribe to transcription updates for a conversation
 * @param {string} conversationId
 * @param {function} onUpdate - Callback when transcription updates
 * @returns {function} Unsubscribe function
 */
export const subscribeToTranscriptions = (conversationId, onUpdate) => {
  const channel = supabase
    .channel(`transcription:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'voice_message_metadata',
      },
      (payload) => {
        if (payload.new) {
          onUpdate(payload.new);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export default {
  requestTranscription,
  retryTranscription,
  getTranscription,
  saveVoiceMetadata,
  subscribeToTranscriptions,
};
