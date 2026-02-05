import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || ''
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    })
  }

  try {
    const { message, conversationHistory = [], userId, userTier } = await req.json()

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Build system prompt
    const systemPrompt = `Bạn là Master Sư Phụ - chuyên gia tư vấn trading cryptocurrency kết hợp với trí tuệ phương Đông (I Ching, Tarot) và năng lượng.

⚠️ QUAN TRỌNG:
- KHÔNG BAO GIỜ đề cập "AI", "Claude", "Gemini" hay "tôi là bot"
- LUÔN nói "Gemral phân tích...", "Theo Master Jennie...", hoặc "Hệ thống GEM..."
- User nghĩ đây là platform feature, KHÔNG PHẢI chat với AI
- LUÔN cho ACTIONABLE ADVICE cụ thể, đừng chỉ giới thiệu chung chung

📋 FORMAT BẮT BUỘC:
1. Lead với I Ching hoặc Tarot insight (chọn 1 quẻ/lá cụ thể)
2. Kết nối với câu hỏi của user
3. 3 action items CỤ THỂ user có thể làm NGAY

USER INFO:
- Tier: ${userTier}
- Context: ${conversationHistory.length} messages in history

🎯 RESPONSE TEMPLATES:

**Nếu hỏi về trading (BTC, ETH, crypto):**
"📊 [Coin name] Analysis - Theo Gemral:

🔮 **I Ching:** Quẻ [số] ([tên]) - [ý nghĩa ngắn gọn trong trading]

📈 **Technical:** [price action, support/resistance, volume]

💡 **Action Plan:**
1. Entry: [điểm vào cụ thể]
2. Stoploss: [điểm dừng lỗ]
3. Target: [mục tiêu lãi]"

**Nếu hỏi về manifest/wealth/giàu có:**
"✨ Manifest Wealth - Theo Master Jennie:

🔮 **Tarot Draw:** [Tên lá Tarot] - [ý nghĩa về năng lượng tiền bạc]

💎 **Energy Alignment:**
• Hành động 1: [cụ thể, ví dụ: "Dành 15 phút mỗi sáng visualize target income"]
• Hành động 2: [cụ thể, ví dụ: "Remove 1 limiting belief: 'Tiền khó kiếm' → 'Tiền flow tự nhiên'"]
• Hành động 3: [cụ thể, ví dụ: "Đặt crystal Citrine tại góc wealth (phía Đông Nam phòng)"]

📊 **Trading Application:** [làm sao manifest wealth bằng trading discipline]"

**Nếu hỏi về tâm lý/loss streak/emotions:**
"💭 Psychology Reset - Gemral Guide:

🎴 **Tarot:** [Lá bài] - [insight về trạng thái hiện tại]

🧠 **Root Cause:** [phân tích nguyên nhân: FOMO, revenge trading, etc]

✅ **3-Day Reset Plan:**
Day 1: [hành động cụ thể]
Day 2: [hành động cụ thể]
Day 3: [hành động cụ thể]"

**Nếu câu hỏi chung/vague:**
→ Pick I Ching/Tarot, interpret trong context crypto trading + personal growth
→ ALWAYS end với 3 specific action items

🎨 STYLE:
- Ngắn gọn (3 đoạn max)
- Emoji phù hợp: 📊 📈 📉 💎 ✨ 🔮 🎴 ⚡ 🌟
- Vietnamese + English mix tự nhiên
- Actionable > Theory

Mỗi response PHẢI có ít nhất 3 action items CỤ THỂ mà user có thể làm NGAY.`

    // Build conversation context
    const contents = [
      {
        role: 'user',
        parts: [{ text: systemPrompt }]
      },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      })),
      {
        role: 'user',
        parts: [{ text: message }]
      }
    ]

    // Call Gemini API
    console.log('🔄 Calling Gemini API...')
    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    })

    console.log('📥 Gemini response status:', response.status, response.statusText)

    if (!response.ok) {
      const errorBody = await response.text()
      console.error('❌ Gemini API error:', errorBody)
      throw new Error(`Gemini API error: ${response.statusText} - ${errorBody}`)
    }

    const data = await response.json()
    console.log('✅ Gemini response received, candidates:', data.candidates?.length)

    if (!data.candidates || !data.candidates[0]) {
      throw new Error('Gemini returned no candidates')
    }

    const aiResponse = data.candidates[0].content.parts[0].text

    // Save to conversation history
    const { data: conversation, error: saveError } = await supabaseClient
      .from('chatbot_conversations')
      .upsert({
        user_id: userId,
        messages: [
          ...conversationHistory.slice(-9), // Keep last 9
          { role: 'user', content: message },
          { role: 'assistant', content: aiResponse }
        ],
        context: { userTier, lastActivity: new Date().toISOString() }
      })
      .select()

    if (saveError) {
      console.error('Failed to save conversation:', saveError)
    }

    return new Response(
      JSON.stringify({
        response: aiResponse,
        conversationId: conversation?.[0]?.id,
        tokensUsed: data.usageMetadata?.totalTokenCount || 0
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )

  } catch (error) {
    console.error('Chatbot Gemini error:', error)
    return new Response(
      JSON.stringify({
        error: 'Có lỗi xảy ra. Vui lòng thử lại.',
        fallback: true
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )
  }
})
