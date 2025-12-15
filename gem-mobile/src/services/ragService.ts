// src/services/ragService.ts
// RAG Service for GEM Master Chatbot
// GEMRAL AI BRAIN - Phase 2

import { supabase } from './supabase';

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const EDGE_FUNCTION_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const KNOWLEDGE_SEARCH_FUNCTION = 'knowledge-search';
const GEM_MASTER_CHAT_FUNCTION = 'gem-master-chat';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface KnowledgeSource {
  id: string;
  title: string;
  similarity: number;
  sourceType: string;
  category?: string;
  chunkText: string;
}

export interface RAGSearchResult {
  results: KnowledgeSource[];
  queryLength: number;
  thresholdUsed: number;
}

export interface RAGChatRequest {
  message: string;
  conversationHistory?: Array<{ role: string; content: string }>;
  userId?: string;
  userTier?: string;
  sessionId?: string;
  useRAG?: boolean;
}

export interface RAGChatResponse {
  response: string;
  ragUsed: boolean;
  sources: string[];
  tokensUsed: number;
  error?: string;
  fallback?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// KNOWLEDGE SEARCH
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Search knowledge base for relevant context
 */
export async function searchKnowledge(
  query: string,
  options?: {
    sourceType?: string;
    category?: string;
    matchCount?: number;
    matchThreshold?: number;
  }
): Promise<RAGSearchResult | null> {
  try {
    console.log('[RAG] Searching knowledge:', query.substring(0, 50));

    const { data, error } = await supabase.functions.invoke(KNOWLEDGE_SEARCH_FUNCTION, {
      body: {
        query,
        source_type: options?.sourceType,
        category: options?.category,
        match_count: options?.matchCount || 5,
        match_threshold: options?.matchThreshold || 0.65,
      },
    });

    if (error) {
      console.error('[RAG] Search error:', error);
      return null;
    }

    const results: KnowledgeSource[] = (data?.results || []).map((r: any) => ({
      id: r.id,
      title: r.title,
      similarity: r.similarity,
      sourceType: r.source_type,
      category: r.category,
      chunkText: r.chunk_text,
    }));

    console.log(`[RAG] Found ${results.length} results`);

    return {
      results,
      queryLength: data?.query_length || query.length,
      thresholdUsed: data?.threshold_used || 0.65,
    };
  } catch (err) {
    console.error('[RAG] Search failed:', err);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// RAG CHAT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Send message to GEM Master with RAG
 */
export async function sendRAGMessage(
  request: RAGChatRequest
): Promise<RAGChatResponse> {
  try {
    console.log('[RAG] Sending message:', request.message.substring(0, 50));

    const { data, error } = await supabase.functions.invoke(GEM_MASTER_CHAT_FUNCTION, {
      body: {
        message: request.message,
        conversationHistory: request.conversationHistory || [],
        userId: request.userId,
        userTier: request.userTier || 'FREE',
        sessionId: request.sessionId,
        useRAG: request.useRAG !== false, // Default to true
      },
    });

    if (error) {
      console.error('[RAG] Chat error:', error);
      return {
        response: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.',
        ragUsed: false,
        sources: [],
        tokensUsed: 0,
        error: error.message,
        fallback: true,
      };
    }

    return {
      response: data?.response || 'Xin lỗi, không nhận được phản hồi.',
      ragUsed: data?.ragUsed || false,
      sources: data?.sources || [],
      tokensUsed: data?.tokensUsed || 0,
      fallback: data?.fallback,
    };
  } catch (err) {
    console.error('[RAG] Chat failed:', err);
    return {
      response: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.',
      ragUsed: false,
      sources: [],
      tokensUsed: 0,
      error: err instanceof Error ? err.message : 'Unknown error',
      fallback: true,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// KNOWLEDGE CONTEXT BUILDER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Build context string from knowledge sources
 */
export function buildKnowledgeContext(sources: KnowledgeSource[]): string {
  if (sources.length === 0) return '';

  let context = '\n--- KIẾN THỨC THAM KHẢO ---\n\n';

  sources.forEach((source, index) => {
    const similarity = Math.round(source.similarity * 100);
    context += `[${index + 1}] ${source.title} (${similarity}% match):\n`;
    context += `${source.chunkText.substring(0, 500)}${source.chunkText.length > 500 ? '...' : ''}\n\n`;
  });

  return context;
}

// ═══════════════════════════════════════════════════════════════════════════
// FEEDBACK
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Submit feedback for a RAG response
 */
export async function submitRAGFeedback(
  userId: string,
  query: string,
  response: string,
  rating: 'positive' | 'negative',
  feedbackText?: string,
  sources?: string[]
): Promise<boolean> {
  try {
    console.log('[RAG] Submitting feedback:', rating);

    const { error } = await supabase.from('ai_response_feedback').insert({
      user_id: userId,
      query: query.substring(0, 1000),
      response: response.substring(0, 2000),
      rating,
      feedback_text: feedbackText,
      sources_used: sources,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('[RAG] Feedback error:', error);
      return false;
    }

    console.log('[RAG] Feedback submitted successfully');
    return true;
  } catch (err) {
    console.error('[RAG] Feedback failed:', err);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// KNOWLEDGE GAP TRACKING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Track a knowledge gap (unanswered question)
 */
export async function trackKnowledgeGap(
  query: string,
  userId?: string
): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('increment_knowledge_gap', {
      p_query: query.substring(0, 500),
      p_user_id: userId || null,
    });

    if (error) {
      console.error('[RAG] Gap tracking error:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[RAG] Gap tracking failed:', err);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SPECIALIZED SEARCH FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Search for spiritual knowledge
 */
export async function searchSpiritualKnowledge(query: string): Promise<KnowledgeSource[]> {
  const result = await searchKnowledge(query, {
    sourceType: 'spiritual',
    matchCount: 5,
  });
  return result?.results || [];
}

/**
 * Search for trading knowledge
 */
export async function searchTradingKnowledge(query: string): Promise<KnowledgeSource[]> {
  const result = await searchKnowledge(query, {
    sourceType: 'trading',
    matchCount: 5,
  });
  return result?.results || [];
}

/**
 * Search for product recommendations
 */
export async function searchProductKnowledge(query: string): Promise<KnowledgeSource[]> {
  const result = await searchKnowledge(query, {
    sourceType: 'product',
    matchCount: 3,
  });
  return result?.results || [];
}

/**
 * Search for crystal recommendations
 */
export async function searchCrystalKnowledge(query: string): Promise<KnowledgeSource[]> {
  const result = await searchKnowledge(query, {
    sourceType: 'spiritual',
    category: 'crystal',
    matchCount: 5,
  });
  return result?.results || [];
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export default {
  searchKnowledge,
  sendRAGMessage,
  buildKnowledgeContext,
  submitRAGFeedback,
  trackKnowledgeGap,
  searchSpiritualKnowledge,
  searchTradingKnowledge,
  searchProductKnowledge,
  searchCrystalKnowledge,
};
