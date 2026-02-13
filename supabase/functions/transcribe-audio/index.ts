/**
 * Supabase Edge Function - Transcribe Audio
 * Uses OpenAI Whisper API for speech-to-text
 *
 * Supports:
 * - Vietnamese (vi) - Primary
 * - English (en) - Secondary
 *
 * Endpoint: POST /functions/v1/transcribe-audio
 * Body: FormData with 'audio' file and optional 'language'
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify OpenAI API key is configured
    if (!OPENAI_API_KEY) {
      console.error('[TranscribeAudio] OPENAI_API_KEY not configured');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Speech-to-text service not configured',
          code: 'SERVICE_NOT_CONFIGURED',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse multipart form data
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    const language = (formData.get('language') as string) || 'vi';
    const prompt = (formData.get('prompt') as string) || '';

    if (!audioFile) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No audio file provided',
          code: 'NO_AUDIO_FILE',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`[TranscribeAudio] Processing audio file: ${audioFile.name}, size: ${audioFile.size}, language: ${language}`);

    // Validate file size (max 25MB for Whisper)
    const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
    if (audioFile.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Audio file too large. Maximum size is 25MB.',
          code: 'FILE_TOO_LARGE',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Prepare FormData for OpenAI API
    const whisperFormData = new FormData();
    whisperFormData.append('file', audioFile, audioFile.name || 'recording.m4a');
    whisperFormData.append('model', 'whisper-1');
    whisperFormData.append('language', language.split('-')[0]); // 'vi-VN' -> 'vi'
    whisperFormData.append('response_format', 'json');

    // Add prompt for better context (helps with Vietnamese accuracy)
    if (prompt) {
      whisperFormData.append('prompt', prompt);
    } else if (language.startsWith('vi')) {
      // Default Vietnamese context prompt
      whisperFormData.append('prompt', 'Đây là câu hỏi về đá quý, phong thủy, tarot, kinh dịch, hoặc trading.');
    }

    // Call OpenAI Whisper API
    console.log('[TranscribeAudio] Calling OpenAI Whisper API...');
    const startTime = Date.now();

    const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: whisperFormData,
    });

    const processingTime = Date.now() - startTime;
    console.log(`[TranscribeAudio] Whisper API response time: ${processingTime}ms`);

    if (!whisperResponse.ok) {
      const errorText = await whisperResponse.text();
      console.error('[TranscribeAudio] Whisper API error:', whisperResponse.status, errorText);

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Transcription failed',
          code: 'WHISPER_API_ERROR',
          details: errorText,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const result = await whisperResponse.json();
    console.log('[TranscribeAudio] Transcription result:', result.text?.substring(0, 100) + '...');

    // Log usage for analytics (optional - store in database)
    try {
      const authHeader = req.headers.get('Authorization');
      if (authHeader && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        const token = authHeader.replace('Bearer ', '');

        // Get user from token
        const { data: { user } } = await supabase.auth.getUser(token);

        if (user) {
          // Log transcription usage
          await supabase.from('voice_transcription_logs').insert({
            user_id: user.id,
            audio_size_bytes: audioFile.size,
            language: language,
            transcript_length: result.text?.length || 0,
            processing_time_ms: processingTime,
            created_at: new Date().toISOString(),
          }).catch(err => {
            // Table might not exist, just log
            console.log('[TranscribeAudio] Could not log usage:', err.message);
          });
        }
      }
    } catch (logError) {
      // Don't fail the request if logging fails
      console.log('[TranscribeAudio] Usage logging skipped:', logError.message);
    }

    return new Response(
      JSON.stringify({
        success: true,
        text: result.text || '',
        language: language,
        processingTimeMs: processingTime,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('[TranscribeAudio] Unexpected error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Transcription failed',
        code: 'UNEXPECTED_ERROR',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
