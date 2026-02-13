// Integration tests for ResponseDetector and DataExtractor services

import { ResponseDetector, ResponseTypes } from '../responseDetector';
import { DataExtractor } from '../dataExtractor';

describe('ResponseDetector', () => {
  const detector = new ResponseDetector();

  test('Should detect MANIFESTATION_GOAL', () => {
    const sampleResponse = `
    🎯 MỤC TIÊU: Kiếm thêm 100 triệu VND passive income
    💰 Target: 100 triệu VND
    📅 Timeline: 6 tháng

    ✨ AFFIRMATIONS:
    ✨ "Tôi xứng đáng với 100 triệu mỗi tháng"
    ✨ "Tiền bạc chảy vào cuộc đời tôi dễ dàng"

    📋 ACTION PLAN:
    Week 1: Research
    • Task 1
    `;

    const result = detector.detect(sampleResponse);

    expect(result.type).toBe(ResponseTypes.MANIFESTATION_GOAL);
    expect(result.confidence).toBeGreaterThan(0.9);
  });

  test('Should detect CRYSTAL_RECOMMENDATION', () => {
    const sampleResponse = `
    💎 CRYSTAL RECOMMENDATIONS:
    • Citrine - For abundance and prosperity
    • Rose Quartz - For love and compassion

    🧘 PLACEMENT GUIDE:
    • Desk: Citrine for work success
    • Bedroom: Rose Quartz for relationships

    🌙 CLEANSING:
    • Full moon energy cleansing
    • Smoke cleansing with sage
    `;

    const result = detector.detect(sampleResponse);
    expect(result.type).toBe(ResponseTypes.CRYSTAL_RECOMMENDATION);
    expect(result.confidence).toBeGreaterThan(0.9);
  });

  test('Should detect TRADING_ANALYSIS', () => {
    const sampleResponse = `
    🔮 SPIRITUAL ANALYSIS:
    • Root chakra imbalance causing fear-based trading
    • Solar plexus chakra block affecting confidence

    📚 LESSONS:
    • Always set stop loss
    • Don't trade with emotions

    💎 HEALING PLAN:
    • Use Black Tourmaline for grounding
    • Practice meditation before trading
    `;

    const result = detector.detect(sampleResponse);
    expect(result.type).toBe(ResponseTypes.TRADING_ANALYSIS);
    expect(result.confidence).toBeGreaterThan(0.85);
  });

  test('Should detect AFFIRMATIONS_ONLY', () => {
    const sampleResponse = `
    ✨ "I am worthy of abundance"
    ✨ "Money flows to me easily"
    ✨ "I attract prosperity"
    ✨ "I am financially free"
    `;

    const result = detector.detect(sampleResponse);
    expect(result.type).toBe(ResponseTypes.AFFIRMATIONS_ONLY);
    expect(result.confidence).toBeGreaterThan(0.85);
  });

  test('Should detect ICHING_READING', () => {
    const sampleResponse = `
    📿 I CHING READING:
    Quẻ Càn (Heaven) - Hexagram 1

    This hexagram represents creative force and leadership.
    `;

    const result = detector.detect(sampleResponse);
    expect(result.type).toBe(ResponseTypes.ICHING_READING);
    expect(result.confidence).toBeGreaterThan(0.9);
  });

  test('Should detect TAROT_READING', () => {
    const sampleResponse = `
    🔮 TAROT READING:
    The Fool - Major Arcana

    New beginnings and taking a leap of faith.
    `;

    const result = detector.detect(sampleResponse);
    expect(result.type).toBe(ResponseTypes.TAROT_READING);
    expect(result.confidence).toBeGreaterThan(0.9);
  });

  test('Should detect GENERAL_CHAT when no special markers', () => {
    const sampleResponse = "Hello, how can I help you today?";
    const result = detector.detect(sampleResponse);
    expect(result.type).toBe(ResponseTypes.GENERAL_CHAT);
    expect(result.confidence).toBe(1.0);
  });

  test('Should handle empty response', () => {
    const result = detector.detect('');
    expect(result.type).toBe(ResponseTypes.GENERAL_CHAT);
    expect(result.confidence).toBe(1.0);
  });

  test('Should handle null response', () => {
    const result = detector.detect(null);
    expect(result.type).toBe(ResponseTypes.GENERAL_CHAT);
    expect(result.confidence).toBe(1.0);
  });
});

describe('DataExtractor', () => {
  const extractor = new DataExtractor();

  test('Should extract goal title with emoji', () => {
    const text = "🎯 MỤC TIÊU: Kiếm 100 triệu VND";
    const title = extractor.extractTitle(text);
    expect(title).toBe("Kiếm 100 triệu VND");
  });

  test('Should extract goal title without emoji', () => {
    const text = "Mục tiêu: Build a successful business";
    const title = extractor.extractTitle(text);
    expect(title).toContain("Build a successful business");
  });

  test('Should extract amount in triệu', () => {
    const text = "💰 Target: 100 triệu VND";
    const amount = extractor.extractAmount(text);
    expect(amount).toBe(100000000);
  });

  test('Should extract amount with commas', () => {
    const text = "Target: 1,000 triệu VND";
    const amount = extractor.extractAmount(text);
    expect(amount).toBeGreaterThan(0);
  });

  test('Should return null for no amount', () => {
    const text = "No money mentioned here";
    const amount = extractor.extractAmount(text);
    expect(amount).toBeNull();
  });

  test('Should extract timeline in months', () => {
    const text = "📅 Timeline: 6 tháng";
    const timeline = extractor.extractTimeline(text);
    expect(timeline).toEqual({ months: 6 });
  });

  test('Should extract timeline in weeks', () => {
    const text = "Timeline: 12 weeks";
    const timeline = extractor.extractTimeline(text);
    expect(timeline).toEqual({ weeks: 12 });
  });

  test('Should default to 6 months if no timeline', () => {
    const text = "No timeline mentioned";
    const timeline = extractor.extractTimeline(text);
    expect(timeline).toEqual({ months: 6 });
  });

  test('Should extract affirmations with sparkle emoji', () => {
    const text = `
    ✨ "I am worthy of abundance"
    ✨ "Money flows to me easily"
    `;
    const affirmations = extractor.extractAffirmations(text);
    expect(affirmations.length).toBeGreaterThan(0);
  });

  test('Should extract affirmations with bullets', () => {
    const text = `
    • "I attract prosperity and success"
    • "I am financially free and secure"
    `;
    const affirmations = extractor.extractAffirmations(text);
    expect(affirmations.length).toBeGreaterThan(0);
  });

  test('Should limit affirmations to 10', () => {
    const text = `
    ✨ "Affirmation 1 with enough text to pass the length check"
    ✨ "Affirmation 2 with enough text to pass the length check"
    ✨ "Affirmation 3 with enough text to pass the length check"
    ✨ "Affirmation 4 with enough text to pass the length check"
    ✨ "Affirmation 5 with enough text to pass the length check"
    ✨ "Affirmation 6 with enough text to pass the length check"
    ✨ "Affirmation 7 with enough text to pass the length check"
    ✨ "Affirmation 8 with enough text to pass the length check"
    ✨ "Affirmation 9 with enough text to pass the length check"
    ✨ "Affirmation 10 with enough text to pass the length check"
    ✨ "Affirmation 11 with enough text to pass the length check"
    ✨ "Affirmation 12 with enough text to pass the length check"
    `;
    const affirmations = extractor.extractAffirmations(text);
    expect(affirmations.length).toBeLessThanOrEqual(10);
  });

  test('Should extract action steps by week', () => {
    const text = `
    Week 1: Foundation
    • Research market
    • Create plan

    Week 2: Implementation
    • Launch MVP
    • Get feedback
    `;
    const steps = extractor.extractActionSteps(text);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].week).toBe(1);
    expect(steps[0].tasks.length).toBeGreaterThan(0);
  });

  test('Should extract crystals from crystal section', () => {
    const text = `
    💎 CRYSTALS:
    • Citrine - For abundance
    • Rose Quartz - For love
    • Black Tourmaline - For protection
    `;
    const crystals = extractor.extractCrystals(text);
    expect(crystals.length).toBeGreaterThan(0);
  });

  test('Should limit crystals to 5', () => {
    const text = `
    💎 CRYSTAL RECOMMENDATIONS:
    • Crystal 1
    • Crystal 2
    • Crystal 3
    • Crystal 4
    • Crystal 5
    • Crystal 6
    • Crystal 7
    `;
    const crystals = extractor.extractCrystals(text);
    expect(crystals.length).toBeLessThanOrEqual(5);
  });

  test('Should extract complete manifestation data', () => {
    const fullResponse = `
    🎯 MỤC TIÊU: Launch successful online business
    💰 Target: 500 triệu VND
    📅 Timeline: 12 tháng

    ✨ AFFIRMATIONS:
    ✨ "I am a successful entrepreneur"
    ✨ "My business grows every day"

    📋 ACTION PLAN:
    Week 1: Research
    • Market research
    • Competitor analysis

    Week 2: Planning
    • Business plan
    • Financial projections

    💎 CRYSTALS:
    • Citrine - Abundance
    • Tiger's Eye - Confidence
    `;

    const data = extractor.extractManifestationData(fullResponse);

    expect(data.goalTitle).toContain("Launch");
    expect(data.targetAmount).toBe(500000000);
    expect(data.timeline.months).toBe(12);
    expect(data.affirmations.length).toBeGreaterThan(0);
    expect(data.actionSteps.length).toBeGreaterThan(0);
    expect(data.crystalRecommendations.length).toBeGreaterThan(0);
  });
});
