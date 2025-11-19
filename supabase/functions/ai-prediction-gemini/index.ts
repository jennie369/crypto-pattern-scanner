import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || 'AIzaSyCymkgeL0ERDYYePtbV4zuL-BZ2mfMxehc'
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent'

serve(async (req) => {
  try {
    // CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, user-id',
        }
      })
    }

    // Parse request
    const { candles, patterns, symbol, timeframe } = await req.json()

    if (!candles || !patterns || candles.length === 0) {
      throw new Error('Missing required data: candles and patterns')
    }

    console.log(`AI Prediction request for ${symbol} ${timeframe}`)

    // Format prompt for Gemini
    const prompt = `
You are an expert cryptocurrency trader analyzing market data using the GEM Frequency Trading Method.

🎯 CRITICAL CONTEXT - READ CAREFULLY:

This is ZONE RETEST TRADING, NOT breakout trading!

KEY PRINCIPLES:
1. Patterns (DPD/UPU/UPD/DPU) create zones (HFZ/LFZ)
2. Zones are tradeable ONLY on RETEST (not at breakout!)
3. Entry requires: Price retest zone + Confirmation candle
4. Target win rate: 68%+ (proven by backtesting)

PATTERN → ZONE MAPPING:
- DPD pattern → Creates HFZ (High Frequency Zone) = Resistance/SHORT zone
- UPU pattern → Creates LFZ (Low Frequency Zone) = Support/LONG zone
- UPD pattern → Creates HFZ (reversal top)
- DPU pattern → Creates LFZ (reversal bottom)

ENTRY RULES (MUST FOLLOW):
1. Wait for price to RETEST the zone (come back to it)
2. Look for confirmation candle:
   - HFZ: Bearish pin bar, shooting star, bearish engulfing
   - LFZ: Hammer, bullish pin bar, bullish engulfing
3. Entry at zone boundary with confirmation
4. Stop loss: Beyond zone + 0.5%
5. Target: Minimum 1:2 Risk:Reward

ZONE STATUS:
- Fresh (0 tests): ⭐⭐⭐⭐⭐ Best
- Tested 1x: ⭐⭐⭐⭐ Good
- Tested 2x: ⭐⭐⭐ Okay
- Tested 3+: ❌ Skip (zone weak)

📊 CURRENT MARKET DATA:

Symbol: ${symbol}
Timeframe: ${timeframe}

Last 50 Candles:
${JSON.stringify(candles.slice(-50).map((c: any) => ({
      time: c.timestamp,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
      volume: c.volume
    })), null, 2)}

Detected Patterns (Frequency Method):
${JSON.stringify(patterns, null, 2)}

🎯 YOUR TASK:

Analyze this data and provide a trading prediction following the zone retest strategy.

IMPORTANT ANALYSIS STEPS:
1. Identify strongest pattern with fresh zone
2. Determine if price is approaching retest of that zone
3. Check for confirmation candle (if already retesting)
4. Calculate confidence based on:
   - Pattern strength
   - Zone freshness (how many times tested)
   - Volume confirmation
   - Multiple timeframe alignment
5. Provide clear action: LONG/SHORT/WAIT

⚠️ CRITICAL OUTPUT REQUIREMENTS:

Respond with ONLY valid JSON in this EXACT format (no extra text, no markdown, no backticks):

{
  "confidence": 75,
  "prediction": "UP",
  "nextPrice": 45000,
  "timeframe": "4-8 hours",
  "keyLevels": {
    "support": [43500, 42000],
    "resistance": [46000, 48000]
  },
  "risk": "MEDIUM",
  "action": "LONG",
  "reasoning": "Strong UPU pattern detected at 43200-43800 creating fresh LFZ (⭐⭐⭐⭐⭐). Price currently at 44500, approaching retest zone. Strategy: WAIT for price to drop to 43500 LFZ zone. Entry ONLY if bullish confirmation candle appears (hammer/engulfing). Stop loss: 42000 (-3.5%). Target: 46800 (+7.5%, R:R 1:2.1). Pattern confidence: 82%. Historical win rate for fresh UPU zones: 71%. Volume increasing on approach = bullish. Risk: MEDIUM due to overall market volatility."
}

FIELD REQUIREMENTS:
- confidence: Integer 0-100 (how confident in this prediction)
- prediction: "UP" | "DOWN" | "SIDEWAYS"
- nextPrice: Number (estimated target price)
- timeframe: String (estimated time to reach target)
- keyLevels.support: Array of numbers (key support levels)
- keyLevels.resistance: Array of numbers (key resistance levels)
- risk: "LOW" | "MEDIUM" | "HIGH"
- action: "LONG" | "SHORT" | "WAIT"
- reasoning: Detailed string (MUST mention zone retest strategy, confirmation requirements, R:R ratio, zone status)

REASONING MUST INCLUDE:
✅ Pattern type and zone created (HFZ/LFZ)
✅ Zone status (fresh/tested)
✅ Current price vs zone (approaching/retesting/away)
✅ Entry strategy (wait for retest + confirmation)
✅ Stop loss placement
✅ Target and R:R ratio
✅ Historical win rate for this setup
✅ Risk factors

DO NOT:
❌ Suggest entry at breakout (must wait for retest!)
❌ Skip confirmation requirement
❌ Trade weak zones (3+ tests)
❌ Include any text outside JSON
❌ Use markdown or code blocks

RESPOND WITH PURE JSON ONLY.
`.trim()

    // Call Gemini API
    console.log('Calling Gemini API...')

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
          responseMimeType: "application/json" // 🔥 Native JSON mode!
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_NONE"
          }
        ]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error:', errorText)
      throw new Error(`Gemini API failed: ${response.status} - ${errorText}`)
    }

    const data = await response.json()

    // Check for API errors
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response from Gemini API')
    }

    // Parse response
    const generatedText = data.candidates[0].content.parts[0].text

    console.log('Gemini response received:', generatedText.substring(0, 200))

    // Parse JSON
    let prediction
    try {
      prediction = JSON.parse(generatedText)
    } catch (e) {
      console.error('JSON parse error:', e)
      console.error('Generated text:', generatedText)

      // Fallback: try to clean and parse
      const cleaned = generatedText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      prediction = JSON.parse(cleaned)
    }

    // Validate prediction structure
    const requiredFields = ['confidence', 'prediction', 'nextPrice', 'keyLevels', 'risk', 'action', 'reasoning']
    for (const field of requiredFields) {
      if (!prediction[field]) {
        throw new Error(`Missing required field: ${field}`)
      }
    }

    // Validate confidence range
    if (prediction.confidence < 0 || prediction.confidence > 100) {
      throw new Error('Confidence must be 0-100')
    }

    // Validate enums
    if (!['UP', 'DOWN', 'SIDEWAYS'].includes(prediction.prediction)) {
      throw new Error('Invalid prediction value')
    }

    if (!['LOW', 'MEDIUM', 'HIGH'].includes(prediction.risk)) {
      throw new Error('Invalid risk value')
    }

    if (!['LONG', 'SHORT', 'WAIT'].includes(prediction.action)) {
      throw new Error('Invalid action value')
    }

    // Save to Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const userId = req.headers.get('user-id')

    if (userId) {
      const { data: savedPrediction, error: dbError } = await supabase
        .from('ai_predictions')
        .insert([{
          user_id: userId,
          symbol,
          timeframe,
          prediction,
          confidence: prediction.confidence,
          prediction_direction: prediction.prediction,
          suggested_action: prediction.action,
          candles_analyzed: candles.length,
          patterns_detected: patterns.length,
          ai_model: 'gemini-2.0-flash-exp'
        }])
        .select()
        .single()

      if (dbError) {
        console.error('Database error:', dbError)
        // Don't throw - prediction still valid even if save fails
      } else {
        console.log('Prediction saved to database:', savedPrediction.id)
      }
    }

    // Return prediction
    return new Response(
      JSON.stringify(prediction),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )

  } catch (error: any) {
    console.error('Error in ai-prediction-gemini:', error)

    return new Response(
      JSON.stringify({
        error: error.message,
        details: 'AI prediction failed. Please try again.'
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
