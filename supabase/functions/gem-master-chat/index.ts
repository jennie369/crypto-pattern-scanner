// supabase/functions/gem-master-chat/index.ts
// GEM Master Chatbot with RAG Integration
// GEMRAL AI BRAIN - Phase 2

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || '';
// ✅ ENFORCEMENT: Use gemini-2.5-flash with thinking tokens
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// Timeout configuration (in milliseconds)
const API_TIMEOUT_MS = 20000; // 20 seconds for API calls (gemini-2.5-flash needs more time for thinking)

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

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
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Fetch with timeout to prevent hanging
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number = API_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw err;
  }
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
    console.log('[gem-master-chat] Generating embedding...');
    const response = await fetchWithTimeout('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: text.trim(),
      }),
    }, 10000); // 10s timeout for embedding

    if (!response.ok) {
      console.error('[gem-master-chat] Embedding error:', response.status);
      return null;
    }

    const data = await response.json();
    console.log('[gem-master-chat] Embedding generated successfully');
    return data.data[0].embedding;
  } catch (err) {
    console.error('[gem-master-chat] Embedding failed:', err.message);
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

    const startTime = Date.now();
    console.log(`[gem-master-chat] ═══ START Processing ═══`);
    console.log(`[gem-master-chat] Message: "${message.substring(0, 50)}..."`);
    console.log(`[gem-master-chat] User: ${userId}, Tier: ${userTier}, RAG: ${useRAG}`);

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 1: RAG - Retrieve relevant knowledge (optional, won't crash if fails)
    // ═══════════════════════════════════════════════════════════════════════

    let ragContext = '';
    let knowledgeSources: Array<{ title: string; similarity: number }> = [];

    try {
      if (useRAG && OPENAI_API_KEY) {
        console.log(`[gem-master-chat] STEP 1: Starting RAG...`);
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
            await trackKnowledgeGap(supabase, message, userId).catch(() => {});
          }
        }
      }
    } catch (ragError) {
      console.warn('[gem-master-chat] RAG failed, continuing without:', ragError);
    }

    console.log(`[gem-master-chat] STEP 1 complete: RAG sources=${knowledgeSources.length}, elapsed=${Date.now() - startTime}ms`);

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 2: Build system prompt with RAG context
    // ═══════════════════════════════════════════════════════════════════════
    console.log(`[gem-master-chat] STEP 2: Building system prompt...`);

    const systemPrompt = `Bạn là GEM Master - trợ lý trading crypto và tâm linh của Gemral.

═══════════════════════════════════════════════════════════════
⚠️ QUY TẮC QUAN TRỌNG NHẤT - BẮT BUỘC TUÂN THỦ
═══════════════════════════════════════════════════════════════
1. ⚠️ TUYỆT ĐỐI CẤM gọi user là "Gemral", "GEMral", "Gem" → CHỈ gọi "bạn"
2. KHÔNG chào lại nếu đã trong conversation (KHÔNG "Chào bạn", "Xin chào")
3. LUÔN BẮT ĐẦU bằng câu dẫn tự nhiên liên quan đến câu hỏi
4. TRẢ LỜI TRỰC TIẾP vào câu hỏi TRƯỚC, giải thích SAU
5. KHÔNG lan man, không triết lý chung chung
6. Nếu có bài tập: CHỈ đưa 1 bài tập cụ thể, hỏi user nếu muốn thêm
7. Tối đa 250 từ, ngắn gọn, dễ đọc

═══════════════════════════════════════════════════════════════
📊 KHI USER HỎI VỀ COIN/TRADING
═══════════════════════════════════════════════════════════════
Nếu user hỏi "gợi ý coin", "coin tiềm năng", "nên mua gì":

📈 **GỢI Ý TUẦN NÀY** (dựa trên phân tích kỹ thuật):

1. **BTC** - Bitcoin
   - Xu hướng: [LONG/SHORT/SIDEWAY]
   - Entry zone: $XX,XXX - $XX,XXX
   - Target: $XX,XXX | SL: $XX,XXX

2. **ETH** - Ethereum
   - Xu hướng: [LONG/SHORT/SIDEWAY]
   - Entry zone: $X,XXX - $X,XXX
   - Target: $X,XXX | SL: $X,XXX

3. **[ALTCOIN]** - Tên coin
   - Lý do: [Pattern/Signal cụ thể]
   - Entry/Target/SL

⚠️ **Lưu ý**: Đây là phân tích tham khảo, không phải khuyến nghị đầu tư. DYOR!

═══════════════════════════════════════════════════════════════
🎯 DANH TÍNH
═══════════════════════════════════════════════════════════════
- Tên: GEM Master (KHÔNG nói mình là AI/chatbot)
- Ngôn ngữ: Tiếng Việt có dấu đầy đủ
- Phong cách: Chuyên nghiệp, đi thẳng vào vấn đề

═══════════════════════════════════════════════════════════════
📋 CÁCH TRẢ LỜI THEO LOẠI CÂU HỎI
═══════════════════════════════════════════════════════════════
• "Gợi ý coin" → Đưa 3-5 coin cụ thể với entry/target/SL
• "Phân tích BTC/ETH" → Chart pattern, support/resistance, xu hướng
• "Nên long hay short" → Đưa hướng cụ thể + lý do
• "Mindset score" → Phân tích điểm + khuyến nghị trade hay không
• "Tarot/I Ching" → Hướng dẫn dùng tính năng trong app
• "Crystal/đá phong thủy" → Gợi ý loại đá phù hợp

═══════════════════════════════════════════════════════════════
🤝 CHƯƠNG TRÌNH CỘNG TÁC VIÊN (CTV/PARTNERSHIP)
═══════════════════════════════════════════════════════════════
Khi user hỏi về CTV, affiliate, cộng tác viên, hoa hồng:

**CÁC CẤP BẬC VÀ HOA HỒNG:**

| Cấp bậc | Sản phẩm số | Sản phẩm vật lý | Doanh số tích lũy |
|---------|-------------|-----------------|-------------------|
| 🥉 Bronze | 10% | 6% | Bắt đầu (0đ) |
| 🥈 Silver | 15% | 8% | 50 triệu VND |
| 🥇 Gold | 20% | 10% | 150 triệu VND |
| 💎 Platinum | 25% | 12% | 400 triệu VND |
| 👑 Diamond | 30% | 15% | 800 triệu VND |
| ⭐ KOL | 20% (cả 2) | 20% (cả 2) | 20K+ followers |

**SẢN PHẨM ÁP DỤNG:**
- Sản phẩm số: Gói subscription (TIER1/2/3), khóa học, ebooks
- Sản phẩm vật lý: Vòng tay pha lê, đá phong thủy

**CÁCH THAM GIA:**
1. Vào Account > Partnership trong app
2. Sau khi duyệt → nhận mã giới thiệu riêng
3. Chia sẻ mã cho bạn bè
4. Nhận hoa hồng khi đơn hàng thành công

**LƯU Ý:** Hoàn toàn miễn phí, không giới hạn hoa hồng, tự động lên cấp khi đủ doanh số.

═══════════════════════════════════════════════════════════════
USER: Tier ${userTier} | Session: ${sessionId || 'new'}
${ragContext}

═══════════════════════════════════════════════════════════════
📝 FORMAT
═══════════════════════════════════════════════════════════════
1. Trả lời TRỰC TIẾP câu hỏi (không mở đầu dài dòng)
2. Dùng bullet points, dễ đọc
3. Có số liệu cụ thể (giá, %, thời gian)
4. Kết thúc với 1-2 action cụ thể

KHÔNG được: Lan man, triết lý, không đưa câu trả lời cụ thể.`;

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
    // STEP 4: Call Gemini API with retry logic
    // ═══════════════════════════════════════════════════════════════════════

    console.log('[gem-master-chat] Calling Gemini API...');

    let geminiData = null;
    let lastError = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`[gem-master-chat] Attempt ${attempt}/${MAX_RETRIES}`);

        const geminiResponse = await fetchWithTimeout(
          `${GEMINI_URL}?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents,
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 4096, // gemini-2.5-flash với thinking tokens
                topP: 0.9,
              },
            }),
          },
          API_TIMEOUT_MS // 20s timeout for Gemini with thinking tokens
        );

        if (!geminiResponse.ok) {
          const errorText = await geminiResponse.text();
          console.error(`[gem-master-chat] Gemini error (attempt ${attempt}):`, geminiResponse.status, errorText);

          // Retry on 5xx errors
          if (geminiResponse.status >= 500 && attempt < MAX_RETRIES) {
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * attempt));
            continue;
          }
          throw new Error(`Gemini API error: ${geminiResponse.status}`);
        }

        geminiData = await geminiResponse.json();

        if (geminiData.candidates?.[0]?.content?.parts?.[0]?.text) {
          break; // Success!
        } else {
          console.warn(`[gem-master-chat] Empty response (attempt ${attempt})`);
          if (attempt < MAX_RETRIES) {
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * attempt));
            continue;
          }
          throw new Error('No response from Gemini');
        }
      } catch (err) {
        lastError = err;
        console.error(`[gem-master-chat] Attempt ${attempt} failed:`, err.message);
        if (attempt < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * attempt));
        }
      }
    }

    if (!geminiData?.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw lastError || new Error('Failed to get response after retries');
    }

    const aiResponse = geminiData.candidates[0].content.parts[0].text;

    console.log(`[gem-master-chat] Response length: ${aiResponse.length}`);

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 5: Save conversation to database (optional, won't crash if fails)
    // ═══════════════════════════════════════════════════════════════════════

    try {
      if (userId) {
        await supabase
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

        // Update chatbot quota
        const today = new Date().toISOString().split('T')[0];
        await supabase.rpc('increment_chatbot_usage', {
          p_user_id: userId,
          p_date: today,
        }).catch(() => {});
      }
    } catch (saveErr) {
      console.warn('[gem-master-chat] Save failed, continuing:', saveErr);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 6: Return response
    // ═══════════════════════════════════════════════════════════════════════

    const totalElapsed = Date.now() - startTime;
    console.log(`[gem-master-chat] ═══ SUCCESS ═══ Total time: ${totalElapsed}ms, RAG: ${ragContext.length > 0}, Response length: ${aiResponse.length}`);

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
    console.error('[gem-master-chat] Error:', err.message || err);

    // Return 200 with fallback response instead of 500 to avoid client errors
    return new Response(
      JSON.stringify({
        response: `⚠️ Hệ thống đang bận. Vui lòng thử lại sau vài giây.

**Trong lúc chờ, bạn có thể:**
• Xem **Scanner** để tìm patterns
• Khám phá **Tarot/I Ching** trong GEM Master
• Check **Shop** để xem các sản phẩm crystals

Lỗi: ${err.message || 'Unknown error'}`,
        fallback: true,
        error: err.message || 'Unknown error',
      }),
      {
        status: 200, // Return 200 to avoid FunctionsHttpError
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
