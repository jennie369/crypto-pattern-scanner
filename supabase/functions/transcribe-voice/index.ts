// supabase/functions/transcribe-voice/index.ts
// Voice-to-Text Transcription using Gemini 2.5 Flash

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { messageId, audioUrl, language = 'vi' } = await req.json();

    if (!audioUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing audioUrl' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Update status to processing
    if (messageId) {
      await supabase.rpc('update_transcription_status', {
        p_message_id: messageId,
        p_status: 'processing',
      });
    }

    // Fetch audio file
    console.log('[Transcribe] Fetching audio from:', audioUrl);
    const audioResponse = await fetch(audioUrl);

    if (!audioResponse.ok) {
      throw new Error(`Failed to fetch audio: ${audioResponse.status}`);
    }

    const audioBuffer = await audioResponse.arrayBuffer();
    const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

    // Determine mime type from URL
    let mimeType = 'audio/webm';
    if (audioUrl.includes('.mp3')) mimeType = 'audio/mpeg';
    else if (audioUrl.includes('.m4a')) mimeType = 'audio/mp4';
    else if (audioUrl.includes('.ogg')) mimeType = 'audio/ogg';
    else if (audioUrl.includes('.wav')) mimeType = 'audio/wav';
    else if (audioUrl.includes('.aac')) mimeType = 'audio/aac';

    // Call Gemini API
    const prompt = language === 'vi'
      ? 'Hãy chuyển đổi audio này sang text bằng tiếng Việt. Chỉ trả về nội dung đã chuyển đổi, không thêm gì khác. Nếu không nghe rõ hoặc không có nội dung, trả về "[Không có nội dung]".'
      : 'Transcribe this audio to text. Only return the transcribed content, nothing else. If unclear or no content, return "[No content]".';

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType,
                    data: audioBase64,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            topP: 0.8,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('[Transcribe] Gemini error:', errorText);
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    const transcription = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    console.log('[Transcribe] Success:', transcription.substring(0, 100));

    // Update database with transcription
    if (messageId && transcription) {
      await supabase.rpc('update_transcription_status', {
        p_message_id: messageId,
        p_status: 'completed',
        p_transcription: transcription,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        transcription,
        language,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Transcribe] Error:', error);

    // Try to update status to failed
    try {
      const { messageId } = await req.json();
      if (messageId) {
        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
        await supabase.rpc('update_transcription_status', {
          p_message_id: messageId,
          p_status: 'failed',
          p_error: error.message,
        });
      }
    } catch (e) {
      // Ignore
    }

    return new Response(
      JSON.stringify({ error: error.message, success: false }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
