// supabase/functions/knowledge-search/index.ts
// Vector search edge function for RAG
// GEMRAL AI BRAIN - Phase 2

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const EMBEDDING_MODEL = 'text-embedding-3-small';
const DEFAULT_MATCH_COUNT = 5;
const DEFAULT_MATCH_THRESHOLD = 0.7;

// ═══════════════════════════════════════════════════════════════════════════
// CORS HEADERS
// ═══════════════════════════════════════════════════════════════════════════

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface SearchRequest {
  query: string;
  source_type?: string;
  category?: string;
  match_count?: number;
  match_threshold?: number;
}

interface SearchResult {
  id: string;
  document_id: string;
  chunk_text: string;
  similarity: number;
  source_type: string;
  category: string | null;
  title: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// EMBEDDING GENERATION
// ═══════════════════════════════════════════════════════════════════════════

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: text.trim(),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[knowledge-search] OpenAI API error:', error);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════════════════

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request
    const body: SearchRequest = await req.json();
    const {
      query,
      source_type,
      category,
      match_count = DEFAULT_MATCH_COUNT,
      match_threshold = DEFAULT_MATCH_THRESHOLD,
    } = body;

    if (!query || query.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('[knowledge-search] Query:', query.substring(0, 100));

    // Generate embedding for query
    const queryEmbedding = await generateEmbedding(query);

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Call search_knowledge function
    const { data, error } = await supabase.rpc('search_knowledge', {
      query_embedding: queryEmbedding,
      match_threshold: match_threshold,
      match_count: match_count,
      filter_source_type: source_type || null,
      filter_category: category || null,
    });

    if (error) {
      console.error('[knowledge-search] Search error:', error);
      throw error;
    }

    const results: SearchResult[] = data || [];

    console.log(`[knowledge-search] Found ${results.length} results`);

    // Update retrieval stats for found chunks
    if (results.length > 0) {
      const chunkIds = results.map(r => r.id);
      const relevanceScores = results.map(r => r.similarity);

      // Fire and forget - don't await
      supabase.rpc('update_chunk_retrieval', {
        p_chunk_ids: chunkIds,
        p_relevance_scores: relevanceScores,
      }).then(() => {
        console.log('[knowledge-search] Updated retrieval stats');
      }).catch(err => {
        console.error('[knowledge-search] Failed to update stats:', err);
      });
    }

    return new Response(
      JSON.stringify({
        results,
        query_length: query.length,
        threshold_used: match_threshold,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (err) {
    console.error('[knowledge-search] Error:', err);

    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : 'Unknown error',
        results: [],
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
