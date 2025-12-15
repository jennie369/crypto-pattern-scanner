// supabase/functions/gem-master-chat/index.ts
// GEM Master Chatbot with RAG Integration
// GEMRAL AI BRAIN - Phase 2

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || 'AIzaSyCymkgeL0ERDYYePtbV4zuL-BZ2mfMxehc';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const EMBEDDING_MODEL = 'text-embedding-3-small';
const RAG_MATCH_COUNT = 5;
const RAG_THRESHOLD = 0.65;

// ═══════════════════════════════════════════════════════════════════════════
// CORS HEADERS
// ═══════════════════════════════════════════════════════════════════════════

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface ChatRequest {
  message: string;
  conversationHistory?: Array<{ role: string; content: string }>;
  userId?: string;
  userTier?: string;
  sessionId?: string;
  useRAG?: boolean;
}

interface KnowledgeChunk {
  id: string;
  document_id: string;
  chunk_text: string;
  similarity: number;
  source_type: string;
  category: string | null;
  title: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// RAG FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate embedding for query
 */
async function generateEmbedding(text: string): Promise<number[] | null> {
  if (!OPENAI_API_KEY) {
    console.log('[gem-master-chat] No OpenAI API key, skipping RAG');
    return null;
  }

  try {
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
      console.error('[gem-master-chat] Embedding error:', response.status);
      return null;
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (err) {
    console.error('[gem-master-chat] Embedding failed:', err);
    return null;
  }
}

/**
 * Search knowledge base for relevant context
 */
async function searchKnowledge(
  supabase: any,
  query: string,
  embedding: number[]
): Promise<KnowledgeChunk[]> {
  try {
    const { data, error } = await supabase.rpc('search_knowledge', {
      query_embedding: embedding,
      match_threshold: RAG_THRESHOLD,
      match_count: RAG_MATCH_COUNT,
      filter_source_type: null,
      filter_category: null,
    });

    if (error) {
      console.error('[gem-master-chat] Knowledge search error:', error);
      return [];
    }

    console.log(`[gem-master-chat] Found ${data?.length || 0} knowledge chunks`);
    return data || [];
  } catch (err) {
    console.error('[gem-master-chat] Knowledge search failed:', err);
    return [];
  }
}

/**
 * Build RAG context from knowledge chunks
 */
function buildRAGContext(chunks: KnowledgeChunk[]): string {
  if (chunks.length === 0) return '';

  let context = '\n═══════════════════════════════════════════════════════════════\n';
  context += '📚 KIẾN THỨC THAM KHẢO (TỪ CƠ SỞ DỮ LIỆU GEMRAL):\n';
  context += '═══════════════════════════════════════════════════════════════\n\n';

  chunks.forEach((chunk, index) => {
    context += `📌 [${index + 1}] ${chunk.title || chunk.source_type} (${Math.round(chunk.similarity * 100)}% match):\n`;
    context += `${chunk.chunk_text}\n\n`;
  });

  context += '═══════════════════════════════════════════════════════════════\n';
  context += '⚠️ SỬ DỤNG kiến thức trên để trả lời CHÍNH XÁC. Nếu không có thông tin, nói rõ.\n';
  context += '═══════════════════════════════════════════════════════════════\n';

  return context;
}

/**
 * Track knowledge gap if no relevant chunks found
 */
async function trackKnowledgeGap(
  supabase: any,
  query: string,
  userId?: string
): Promise<void> {
  try {
    await supabase.rpc('increment_knowledge_gap', {
      p_query: query.trim().substring(0, 500),
      p_user_id: userId || null,
    });
    console.log('[gem-master-chat] Tracked knowledge gap');
  } catch (err) {
    console.error('[gem-master-chat] Failed to track gap:', err);
  }
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
    const body: ChatRequest = await req.json();
    const {
      message,
      conversationHistory = [],
      userId,
      userTier = 'FREE',
      sessionId,
      useRAG = true,
    } = body;

    if (!message || message.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`[gem-master-chat] Processing: "${message.substring(0, 50)}..."`);
    console.log(`[gem-master-chat] User: ${userId}, Tier: ${userTier}, RAG: ${useRAG}`);

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 1: RAG - Retrieve relevant knowledge
    // ═══════════════════════════════════════════════════════════════════════

    let ragContext = '';
    let knowledgeSources: Array<{ title: string; similarity: number }> = [];

    if (useRAG && OPENAI_API_KEY) {
      const embedding = await generateEmbedding(message);

      if (embedding) {
        const chunks = await searchKnowledge(supabase, message, embedding);

        if (chunks.length > 0) {
          ragContext = buildRAGContext(chunks);
          knowledgeSources = chunks.map(c => ({
            title: c.title || c.source_type,
            similarity: c.similarity,
          }));
        } else {
          // Track knowledge gap for future improvement
          await trackKnowledgeGap(supabase, message, userId);
        }
      }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 2: Build system prompt with RAG context
    // ═══════════════════════════════════════════════════════════════════════

    const systemPrompt = `Bạn là GEM Master - trợ lý AI tâm linh của Gemral, kết hợp trí tuệ phương Đông với công nghệ hiện đại.

═══════════════════════════════════════════════════════════════
🎯 DANH TÍNH
═══════════════════════════════════════════════════════════════
- Tên: GEM Master (KHÔNG phải AI, Claude, GPT, hay chatbot)
- Vai trò: Cố vấn tâm linh, trading, và năng lượng
- Phong cách: Ấm áp, hiểu biết sâu, thực tế
- Ngôn ngữ: Tiếng Việt có dấu đầy đủ

═══════════════════════════════════════════════════════════════
📋 QUY TẮC BẮT BUỘC
═══════════════════════════════════════════════════════════════
1. KHÔNG BAO GIỜ nói "tôi là AI", "tôi là chatbot", "tôi không có cảm xúc"
2. KHÔNG đề cập đến "Claude", "Gemini", "GPT", hoặc bất kỳ tên AI nào
3. Nói "Theo GEM Master...", "Gemral gợi ý...", "Master Jennie đã nghiên cứu..."
4. User nghĩ đây là TÍNH NĂNG của app, KHÔNG PHẢI chat với AI
5. Tối đa 300 từ, chia thành đoạn ngắn dễ đọc
6. LUÔN có 2-3 hành động cụ thể user có thể làm NGAY
7. Dùng emoji phù hợp: 🔮 ✨ 💎 📊 💫 🌟 🎴 ☯️

═══════════════════════════════════════════════════════════════
🔮 LĨNH VỰC CHUYÊN MÔN
═══════════════════════════════════════════════════════════════
1. TÂM LINH & NĂNG LƯỢNG:
   - Thang tần số Hawkins (20-1000 Hz)
   - Ngũ Hành (Kim, Mộc, Thủy, Hỏa, Thổ)
   - Chakra & Luân xa
   - I Ching (Kinh Dịch) - 64 quẻ
   - Tarot - 78 lá bài

2. ĐÁ PHONG THỦY & CRYSTAL:
   - Thạch Anh Tím (Amethyst): Third Eye, Crown Chakra
   - Thạch Anh Hồng (Rose Quartz): Heart Chakra, tình yêu
   - Citrine: Solar Plexus, tài lộc
   - Obsidian: Root Chakra, bảo vệ
   - Tiger Eye: Solar Plexus, dũng cảm

3. GEM FREQUENCY TRADING:
   - 11 công thức độc quyền: DPD, UPU, HFZ, LFZ, etc.
   - Zone Retest là KEY để tăng win rate
   - Tâm lý trading: FOMO, revenge trading, discipline
   - Risk management: R:R ratio, position sizing

4. MANIFEST & CHỮA LÀNH:
   - Money block & limiting beliefs
   - Affirmation theo thang Hawkins
   - Bài tập chuyển hóa nghiệp
   - Vision board & goal setting

═══════════════════════════════════════════════════════════════
USER CONTEXT
═══════════════════════════════════════════════════════════════
- Tier: ${userTier}
- Session: ${sessionId || 'new'}
- History: ${conversationHistory.length} messages
${ragContext}

═══════════════════════════════════════════════════════════════
📝 FORMAT TRẢ LỜI
═══════════════════════════════════════════════════════════════
1. Mở đầu ngắn gọn, ấm áp (1-2 câu)
2. Nội dung chính (chia đoạn, dễ đọc)
3. Kết thúc với 2-3 action items cụ thể
4. Câu hỏi follow-up (tùy chọn)

Nếu có KIẾN THỨC THAM KHẢO ở trên, ƯU TIÊN sử dụng nó để trả lời CHÍNH XÁC.
Nếu không có thông tin, trả lời dựa trên kiến thức chung nhưng nói rõ "Theo kiến thức chung của GEM Master..."`;

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 3: Get conversation history
    // ═══════════════════════════════════════════════════════════════════════

    const contents = [
      {
        role: 'user',
        parts: [{ text: systemPrompt }],
      },
      ...conversationHistory.slice(-6).map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
      {
        role: 'user',
        parts: [{ text: message }],
      },
    ];

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 4: Call Gemini API
    // ═══════════════════════════════════════════════════════════════════════

    console.log('[gem-master-chat] Calling Gemini API...');

    const geminiResponse = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
          topP: 0.9,
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('[gem-master-chat] Gemini error:', errorText);
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();

    if (!geminiData.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error('[gem-master-chat] No response from Gemini');
      throw new Error('No response from Gemini');
    }

    const aiResponse = geminiData.candidates[0].content.parts[0].text;

    console.log(`[gem-master-chat] Response length: ${aiResponse.length}`);

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 5: Save conversation to database
    // ═══════════════════════════════════════════════════════════════════════

    if (userId) {
      const { error: saveError } = await supabase
        .from('chatbot_conversations')
        .upsert({
          user_id: userId,
          session_id: sessionId,
          messages: [
            ...conversationHistory.slice(-9),
            { role: 'user', content: message },
            { role: 'assistant', content: aiResponse },
          ],
          context: {
            userTier,
            ragUsed: ragContext.length > 0,
            knowledgeSources: knowledgeSources.slice(0, 3),
            lastActivity: new Date().toISOString(),
          },
        });

      if (saveError) {
        console.error('[gem-master-chat] Save error:', saveError);
      }

      // Update chatbot quota
      const today = new Date().toISOString().split('T')[0];
      await supabase.rpc('increment_chatbot_usage', {
        p_user_id: userId,
        p_date: today,
      }).catch(() => {
        // Ignore quota errors
      });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 6: Return response
    // ═══════════════════════════════════════════════════════════════════════

    return new Response(
      JSON.stringify({
        response: aiResponse,
        ragUsed: ragContext.length > 0,
        sources: knowledgeSources.slice(0, 3).map(s => s.title),
        tokensUsed: geminiData.usageMetadata?.totalTokenCount || 0,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (err) {
    console.error('[gem-master-chat] Error:', err);

    return new Response(
      JSON.stringify({
        error: 'Có lỗi xảy ra. Vui lòng thử lại sau.',
        response: 'Xin lỗi bạn, GEM Master đang gặp sự cố kỹ thuật. Hãy thử lại sau nhé! 🙏',
        fallback: true,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
