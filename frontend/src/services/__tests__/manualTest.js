// Manual test script for ResponseDetector and DataExtractor
// Run this with: node manualTest.js (with proper ES6 module setup)

import { ResponseDetector, ResponseTypes } from '../responseDetector.js';
import { DataExtractor } from '../dataExtractor.js';

console.log('🧪 Starting Manual Tests for Detection System\n');

const detector = new ResponseDetector();
const extractor = new DataExtractor();

// Test 1: Manifestation Goal Detection
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('TEST 1: MANIFESTATION GOAL DETECTION');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const manifestationResponse = `
🎯 MỤC TIÊU: Kiếm thêm 100 triệu VND passive income trong 6 tháng

💰 Target: 100 triệu VND
📅 Timeline: 6 tháng

✨ AFFIRMATIONS (Daily):
✨ "Tôi xứng đáng với 100 triệu passive income mỗi tháng"
✨ "Tiền bạc chảy vào cuộc đời tôi một cách dễ dàng và tự nhiên"
✨ "Tôi thu hút những cơ hội kiếm tiền liên tục"
✨ "Tôi là nam châm của sự thịnh vượng"
✨ "Thu nhập passive của tôi tăng trưởng mỗi ngày"

📋 ACTION PLAN:

Week 1: Research & Foundation
• Nghiên cứu 5 passive income models
• Chọn 2 models phù hợp với skills
• Set up tracking system

Week 2: Implementation Phase 1
• Launch first income stream
• Create content calendar
• Build email list

Week 3: Optimization
• Analyze performance data
• A/B testing strategies
• Scale what works

💎 CRYSTALS:
• Citrine - Attracts wealth and prosperity
• Pyrite - Manifestation of abundance
• Green Aventurine - Opportunity and luck
`;

const result1 = detector.detect(manifestationResponse);
console.log('Detection Result:', result1);
console.log('\nExtracted Data:');
const data1 = extractor.extractManifestationData(manifestationResponse);
console.log(JSON.stringify(data1, null, 2));

// Test 2: Crystal Recommendation
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('TEST 2: CRYSTAL RECOMMENDATION DETECTION');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const crystalResponse = `
💎 CRYSTAL RECOMMENDATIONS FOR STRESS & ANXIETY:

Based on your energy analysis, here are personalized recommendations:

💎 PRIMARY CRYSTALS:
• Amethyst - Calms the mind, reduces anxiety, promotes restful sleep
• Rose Quartz - Opens heart chakra, self-love, emotional healing
• Black Tourmaline - Grounds energy, shields from negativity

🧘 PLACEMENT GUIDE:
• Bedroom: Amethyst under pillow or on nightstand
• Work Desk: Black Tourmaline to absorb stress
• Meditation Space: Rose Quartz for heart opening

🌙 CLEANSING RITUAL:
• Full moon: Place crystals under moonlight overnight
• Sage smoke: Pass crystals through sage smoke
• Sound: Use singing bowl for energetic cleansing
• Water: Rinse under cool running water (not for all crystals)

⚡ ENERGY WORK:
• Morning: Hold Rose Quartz, set intention for self-love
• During work: Keep Black Tourmaline nearby
• Before sleep: Meditate with Amethyst
`;

const result2 = detector.detect(crystalResponse);
console.log('Detection Result:', result2);

// Test 3: Trading Analysis
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('TEST 3: TRADING ANALYSIS DETECTION');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const tradingResponse = `
🔮 SPIRITUAL ANALYSIS OF YOUR TRADING LOSS:

Based on your BTC long position liquidation at 50x leverage:

🔴 ROOT CAUSE (Chakra Level):
• Solar Plexus Chakra Block - Lack of personal power, overcompensating with high leverage
• Root Chakra Imbalance - Fear of scarcity driving desperate trades
• Third Eye Chakra Clouded - Inability to see the bigger picture

📚 PRACTICAL LESSONS:
• Lesson 1: High leverage amplifies both wins AND losses
• Lesson 2: Emotional trading always leads to mistakes
• Lesson 3: Not using stop loss is gambling, not trading
• Lesson 4: FOMO (Fear of Missing Out) clouds judgment

💎 HEALING PLAN:

CRYSTALS:
• Citrine - Restore confidence and personal power
• Hematite - Grounding and discipline
• Lapis Lazuli - Clear third eye, better judgment

PRACTICES:
• Daily meditation before trading (10 minutes)
• Journaling: Write down trade reasons BEFORE entering
• Affirmations: "I trade with discipline and wisdom"
• Break trading into smaller positions
`;

const result3 = detector.detect(tradingResponse);
console.log('Detection Result:', result3);

// Test 4: General Chat
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('TEST 4: GENERAL CHAT DETECTION');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const generalResponse = `
Hello! I can help you with manifestation, crystal recommendations, and trading guidance.
What would you like to explore today?
`;

const result4 = detector.detect(generalResponse);
console.log('Detection Result:', result4);

// Test 5: Edge Case - Empty Response
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('TEST 5: EDGE CASE - EMPTY RESPONSE');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const result5 = detector.detect('');
console.log('Detection Result:', result5);

// Test 6: Edge Case - Null Response
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('TEST 6: EDGE CASE - NULL RESPONSE');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const result6 = detector.detect(null);
console.log('Detection Result:', result6);

console.log('\n✅ Manual Tests Completed!\n');
