/**
 * knowledgeService.ts
 * Service for RAG Knowledge Base operations
 * GEMRAL AI BRAIN - Phase 1
 */

import { supabase } from './supabase';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface KnowledgeDocument {
  id: string;
  title: string;
  source_type: 'spiritual' | 'trading' | 'product' | 'user_generated' | 'market_data' | 'research';
  category?: string;
  tags?: string[];
  content: string;
  quality_score?: number;
  status: 'active' | 'archived' | 'draft' | 'review';
  created_at: string;
  updated_at: string;
}

export interface KnowledgeChunk {
  id: string;
  document_id: string;
  chunk_text: string;
  chunk_index: number;
  token_count?: number;
  retrieval_count?: number;
  relevance_feedback?: number;
}

export interface KnowledgeSearchResult {
  id: string;
  document_id: string;
  chunk_text: string;
  similarity: number;
  source_type: string;
  category?: string;
  title: string;
}

export interface KnowledgeGap {
  id: string;
  query_text: string;
  feature_context?: string;
  user_id?: string;
  occurrence_count: number;
  status: 'open' | 'in_progress' | 'resolved' | 'ignored';
  first_seen_at: string;
  last_seen_at: string;
}

export interface KnowledgeContext {
  results: KnowledgeSearchResult[];
  context_text: string;
  sources: Array<{
    title: string;
    source_type: string;
  }>;
}

// ═══════════════════════════════════════════════════════════════════════════
// KNOWLEDGE SEARCH
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Search knowledge base using vector similarity
 * This calls the edge function which handles embedding generation
 */
export async function searchKnowledge(
  query: string,
  options?: {
    source_type?: string;
    category?: string;
    match_count?: number;
    match_threshold?: number;
  }
): Promise<KnowledgeSearchResult[]> {
  try {
    const { data, error } = await supabase.functions.invoke('knowledge-search', {
      body: {
        query,
        source_type: options?.source_type,
        category: options?.category,
        match_count: options?.match_count ?? 5,
        match_threshold: options?.match_threshold ?? 0.7,
      },
    });

    if (error) {
      console.error('[KnowledgeService] Search error:', error);
      return [];
    }

    return data?.results ?? [];
  } catch (err) {
    console.error('[KnowledgeService] Search exception:', err);
    return [];
  }
}

/**
 * Get knowledge context for chatbot
 * Returns formatted context string for RAG
 */
export async function getKnowledgeContext(
  query: string,
  featureContext?: string
): Promise<KnowledgeContext> {
  try {
    // Determine source type based on feature context
    let sourceType: string | undefined;
    if (featureContext === 'tarot' || featureContext === 'iching' || featureContext === 'crystals') {
      sourceType = 'spiritual';
    } else if (featureContext === 'trading' || featureContext === 'scanner') {
      sourceType = 'trading';
    }

    const results = await searchKnowledge(query, {
      source_type: sourceType,
      match_count: 5,
      match_threshold: 0.65,
    });

    if (results.length === 0) {
      return {
        results: [],
        context_text: '',
        sources: [],
      };
    }

    // Build context text
    const contextParts = results.map((r, i) => {
      return `[${i + 1}] ${r.chunk_text}`;
    });

    const contextText = contextParts.join('\n\n');

    // Extract unique sources
    const sourcesMap = new Map<string, { title: string; source_type: string }>();
    results.forEach(r => {
      if (!sourcesMap.has(r.document_id)) {
        sourcesMap.set(r.document_id, {
          title: r.title,
          source_type: r.source_type,
        });
      }
    });

    return {
      results,
      context_text: contextText,
      sources: Array.from(sourcesMap.values()),
    };
  } catch (err) {
    console.error('[KnowledgeService] getKnowledgeContext error:', err);
    return {
      results: [],
      context_text: '',
      sources: [],
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// KNOWLEDGE GAP TRACKING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Track a question that couldn't be answered
 */
export async function trackKnowledgeGap(
  queryText: string,
  featureContext?: string,
  userId?: string
): Promise<void> {
  try {
    // Check if gap already exists
    const { data: existing } = await supabase
      .from('ai_knowledge_gaps')
      .select('id')
      .eq('query_text', queryText)
      .single();

    if (existing) {
      // Increment occurrence count
      await supabase.rpc('increment_knowledge_gap', { p_query: queryText });
    } else {
      // Insert new gap
      await supabase.from('ai_knowledge_gaps').insert({
        query_text: queryText,
        feature_context: featureContext,
        user_id: userId,
        occurrence_count: 1,
      });
    }
  } catch (err) {
    console.error('[KnowledgeService] trackKnowledgeGap error:', err);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FEEDBACK
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Submit feedback for a knowledge response
 */
export async function submitKnowledgeFeedback(
  chunkIds: string[],
  isHelpful: boolean,
  relevanceScores?: number[]
): Promise<void> {
  try {
    if (chunkIds.length === 0) return;

    // Update chunk retrieval stats
    if (relevanceScores && relevanceScores.length === chunkIds.length) {
      await supabase.rpc('update_chunk_retrieval', {
        p_chunk_ids: chunkIds,
        p_relevance_scores: relevanceScores,
      });
    }

    // Update document helpful counts
    const documentIds = new Set<string>();
    for (const chunkId of chunkIds) {
      const { data: chunk } = await supabase
        .from('ai_knowledge_chunks')
        .select('document_id')
        .eq('id', chunkId)
        .single();

      if (chunk?.document_id) {
        documentIds.add(chunk.document_id);
      }
    }

    for (const docId of documentIds) {
      if (isHelpful) {
        await supabase
          .from('ai_knowledge_documents')
          .update({
            helpful_count: supabase.sql`helpful_count + 1`,
            usage_count: supabase.sql`usage_count + 1`,
          })
          .eq('id', docId);
      } else {
        await supabase
          .from('ai_knowledge_documents')
          .update({
            not_helpful_count: supabase.sql`not_helpful_count + 1`,
            usage_count: supabase.sql`usage_count + 1`,
          })
          .eq('id', docId);
      }
    }
  } catch (err) {
    console.error('[KnowledgeService] submitKnowledgeFeedback error:', err);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DOCUMENT MANAGEMENT (Admin)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get all knowledge documents (admin)
 */
export async function getKnowledgeDocuments(
  options?: {
    source_type?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }
): Promise<KnowledgeDocument[]> {
  try {
    let query = supabase
      .from('ai_knowledge_documents')
      .select('*')
      .order('updated_at', { ascending: false });

    if (options?.source_type) {
      query = query.eq('source_type', options.source_type);
    }
    if (options?.status) {
      query = query.eq('status', options.status);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit ?? 20) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[KnowledgeService] getKnowledgeDocuments error:', error);
      return [];
    }

    return data ?? [];
  } catch (err) {
    console.error('[KnowledgeService] getKnowledgeDocuments exception:', err);
    return [];
  }
}

/**
 * Get knowledge gaps (admin)
 */
export async function getKnowledgeGaps(
  options?: {
    status?: string;
    limit?: number;
  }
): Promise<KnowledgeGap[]> {
  try {
    let query = supabase
      .from('ai_knowledge_gaps')
      .select('*')
      .order('occurrence_count', { ascending: false });

    if (options?.status) {
      query = query.eq('status', options.status);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[KnowledgeService] getKnowledgeGaps error:', error);
      return [];
    }

    return data ?? [];
  } catch (err) {
    console.error('[KnowledgeService] getKnowledgeGaps exception:', err);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export default {
  searchKnowledge,
  getKnowledgeContext,
  trackKnowledgeGap,
  submitKnowledgeFeedback,
  getKnowledgeDocuments,
  getKnowledgeGaps,
};
