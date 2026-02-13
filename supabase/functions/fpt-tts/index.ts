/**
 * FPT-TTS Edge Function
 * Proxy for FPT.AI Text-to-Speech API
 * Hides API key from client
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const FPT_AI_API_URL = 'https://api.fpt.ai/hmi/tts/v5';
const FPT_AI_API_KEY = Deno.env.get('FPT_AI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

interface TTSRequest {
  text: string;
  voice?: string;
  speed?: string;
  format?: string;
}

interface TTSResponse {
  async: string; // Audio URL
  duration?: number;
  error?: number;
  message?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Validate API key
    if (!FPT_AI_API_KEY) {
      throw new Error('FPT_AI_API_KEY not configured in environment');
    }

    // Parse request
    const { text, voice, speed, format }: TTSRequest = await req.json();

    // Validate required fields
    if (!text || text.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Text is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate voice
    const validVoices = [
      'banmai',
      'linhsan',
      'thuminh',
      'giahuy',
      'minhquang',
      'ngoclam',
      'myan',
      'lannhi',
      'leminh',
    ];
    const selectedVoice = voice && validVoices.includes(voice) ? voice : 'banmai';

    // Validate speed (FPT.AI: -3 to 3, where -3 is slowest, 3 is fastest)
    // We use 0-3 in our service, mapping to FPT.AI format
    const selectedSpeed = speed || '0';

    // Truncate text if too long (FPT.AI limit ~5000 chars)
    const truncatedText = text.slice(0, 5000);

    console.log(
      `[FPT-TTS] Generating audio: voice=${selectedVoice}, speed=${selectedSpeed}, text length=${truncatedText.length}`
    );

    const startTime = Date.now();

    // Call FPT.AI API
    const response = await fetch(FPT_AI_API_URL, {
      method: 'POST',
      headers: {
        'api-key': FPT_AI_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: truncatedText,
        voice: selectedVoice,
        speed: selectedSpeed,
        format: format || 'mp3',
      }),
    });

    const latency = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[FPT-TTS] API error: ${response.status} - ${errorText}`);
      throw new Error(`FPT.AI API error: ${response.status}`);
    }

    const data: TTSResponse = await response.json();

    // Check for FPT.AI error response
    if (data.error && data.error !== 0) {
      console.error(`[FPT-TTS] API returned error: ${data.message}`);
      throw new Error(data.message || 'FPT.AI returned an error');
    }

    console.log(`[FPT-TTS] Success in ${latency}ms, audio URL: ${data.async}`);

    // Return response with additional metadata
    return new Response(
      JSON.stringify({
        async: data.async,
        duration: data.duration || estimateDuration(truncatedText),
        voice: selectedVoice,
        speed: selectedSpeed,
        latency,
        textLength: truncatedText.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[FPT-TTS] Error:', error.message);

    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

/**
 * Estimate audio duration based on text length
 * Approximate: 150 words per minute for Vietnamese
 */
function estimateDuration(text: string): number {
  const words = text.split(/\s+/).length;
  return Math.ceil((words / 150) * 60); // seconds
}
