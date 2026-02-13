# Phase 02: Gemini Integration

## Phase Information

- **Duration:** 3-4 days (10-12 hours)
- **Status:** ⏳ Pending
- **Progress:** 0%
- **Dependencies:** Phase 01 (content must be complete)
- **Priority:** 🔥🔥🔥 CRITICAL

---

## Objectives

Replace keyword-matching chatbot with intelligent Gemini AI that:
1. Understands context and nuance
2. Remembers conversation history (10 messages)
3. Provides personalized trading advice
4. Integrates seamlessly with existing UI

---

## Deliverables

- [ ] Create `chatbot-gemini` edge function
- [ ] Create `chatbot_conversations` table + migration
- [ ] Integrate Gemini API into chat mode
- [ ] Implement conversation memory system
- [ ] Test AI response quality
- [ ] Deploy edge function to Supabase

---

## What Already Exists

✅ **Gemini API working** in `supabase/functions/ai-prediction-gemini/index.ts`
✅ **API Key:** AIzaSyCymkgeL0ERDYYePtbV4zuL-BZ2mfMxehc
✅ **Chat UI** complete in `Chatbot.jsx`
✅ **Keyword matching** in `chatbot.js` (lines 250-294) - will replace

---

## Step 1: Create Conversation Memory Table

### SQL Migration

**File:** `supabase/migrations/20250120_chatbot_conversations.sql`

```sql
-- Conversation memory for Gemini AI
CREATE TABLE IF NOT EXISTS chatbot_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL DEFAULT uuid_generate_v4(),
  messages JSONB[] DEFAULT '{}',
  context JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_conversations_user ON chatbot_conversations(user_id);
CREATE INDEX idx_conversations_session ON chatbot_conversations(session_id);
CREATE INDEX idx_conversations_updated ON chatbot_conversations(updated_at DESC);

-- RLS Policies
ALTER TABLE chatbot_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
  ON chatbot_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
  ON chatbot_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON chatbot_conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
  ON chatbot_conversations FOR DELETE
  USING (auth.uid() = user_id);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_chatbot_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_chatbot_conversation_timestamp
  BEFORE UPDATE ON chatbot_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_chatbot_conversation_timestamp();

COMMENT ON TABLE chatbot_conversations IS 'Stores conversation history for Gemini AI context';
```

**Deploy:**
```bash
supabase migration up
```

---

## Step 2: Create Gemini Edge Function

### File Structure

Create: `supabase/functions/chatbot-gemini/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GEMINI_API_KEY = 'AIzaSyCymkgeL0ERDYYePtbV4zuL-BZ2mfMxehc'
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent'

serve(async (req) => {
  try {
    const { message, conversationHistory = [], userId, userTier } = await req.json()

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Build system prompt
    const systemPrompt = `Bạn là Master Jennie - chuyên gia tư vấn trading cryptocurrency kết hợp với trí tuệ phương Đông (I Ching, Tarot).

QUAN TRỌNG:
- KHÔNG BAO GIỜ đề cập "AI", "Claude", "Gemini" hay "tôi là bot"
- LUÔN nói "GEM Platform phân tích..." hoặc "Theo hệ thống GEM..."
- User nghĩ đây là platform feature, KHÔNG PHẢI chat với AI

TÔN CHỈ:
- Kết hợp phân tích kỹ thuật với trí tuệ I Ching/Tarot
- Giọng điệu: Wise, calming, không áp đặt
- Song ngữ: Vietnamese + English tự nhiên
- Tập trung vào risk management và psychology

KIẾN THỨC:
- 64 quẻ I Ching với ý nghĩa trading
- 78 lá Tarot (Major + Minor Arcana)
- Technical analysis (patterns, indicators)
- Crypto market dynamics

USER INFO:
- Tier: ${userTier}
- Context: ${conversationHistory.length} messages in history

Trả lời ngắn gọn (2-3 đoạn), practical advice, không dài dòng.`

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
    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`)
    }

    const data = await response.json()
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
      { headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Chatbot Gemini error:', error)
    return new Response(
      JSON.stringify({
        error: 'Có lỗi xảy ra. Vui lòng thử lại.',
        fallback: true
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

**Deploy:**
```bash
supabase functions deploy chatbot-gemini
```

---

## Step 3: Integrate into Chat Service

### Modify chatbot.js

**File:** `frontend/src/services/chatbot.js`

**Find:** `async chatWithMaster(message, context)` (line ~250)

**Replace with:**
```javascript
async chatWithMaster(message, conversationHistory = []) {
  try {
    // Call Gemini edge function
    const { data, error } = await supabase.functions.invoke('chatbot-gemini', {
      body: {
        message,
        conversationHistory: conversationHistory.slice(-10), // Last 10 messages
        userId: this.userId,
        userTier: this.userTier || 'FREE'
      }
    })

    if (error) {
      console.error('Gemini API error:', error)
      return this.getFallbackResponse(message)
    }

    return data.response

  } catch (error) {
    console.error('Chat error:', error)
    return this.getFallbackResponse(message)
  }
}

// Fallback response if Gemini fails
getFallbackResponse(message) {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes('btc') || lowerMessage.includes('bitcoin')) {
    return 'GEM Platform đang phân tích BTC... Hiện tại hệ thống gặp sự cố tạm thời. Vui lòng thử lại sau ít phút.'
  }

  return 'Xin lỗi, hệ thống GEM đang bận. Vui lòng thử lại sau giây lát. 🙏'
}
```

---

## Step 4: Update Chatbot UI for Conversation Memory

### Modify Chatbot.jsx

**Add conversation state:**
```javascript
const [conversationHistory, setConversationHistory] = useState([])
const [sessionId, setSessionId] = useState(null)
```

**Load conversation on mount:**
```javascript
useEffect(() => {
  loadConversationHistory()
}, [user])

const loadConversationHistory = async () => {
  if (!user) return

  const { data, error } = await supabase
    .from('chatbot_conversations')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()

  if (data) {
    setSessionId(data.session_id)
    setConversationHistory(data.messages || [])
  }
}
```

**Update handleSend to include history:**
```javascript
const handleSend = async () => {
  // ... existing code ...

  const response = await chatbotService.chatWithMaster(
    input,
    conversationHistory // Pass history
  )

  // Update local history
  setConversationHistory(prev => [
    ...prev.slice(-9),
    { role: 'user', content: input },
    { role: 'assistant', content: response }
  ])

  // ... rest of code ...
}
```

---

## Step 5: Testing

### Test Cases

1. **Basic conversation:**
   - Ask: "BTC có nên mua không?"
   - Verify: AI responds with trading advice
   - Ask follow-up: "Còn ETH thì sao?"
   - Verify: AI references BTC from previous message

2. **Conversation memory:**
   - Ask 3 questions in sequence
   - Verify AI remembers context
   - Refresh page
   - Verify conversation reloads

3. **Error handling:**
   - Disconnect internet
   - Send message
   - Verify fallback response appears

### Verification Checklist

- [ ] Gemini API responds within 2 seconds
- [ ] Responses are contextual (not generic)
- [ ] Conversation memory works (10 messages)
- [ ] Fallback works when API fails
- [ ] No mention of "AI" or "Gemini" in responses
- [ ] Vietnamese + English natural
- [ ] Trading advice specific to crypto

---

## Completion Criteria

- [ ] Edge function deployed successfully
- [ ] Conversation table created with RLS
- [ ] chatbot.js uses Gemini instead of keywords
- [ ] Conversation history persists across sessions
- [ ] All tests passing
- [ ] No breaking changes to existing features
- [ ] Commit: `feat: complete phase-02 - gemini integration`

---

## Next Steps

Open `phase-03-ux-enhancements.md`
