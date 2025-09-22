/**
 * Integration Tests for Scoring Engine and ScoreRecommendationSection
 *
 * These tests validate that the auto-calculation engine integrates correctly
 * with the table display and produces accurate results matching the original
 * Excel scorecard from the PDF requirements.
 */

import {
  calculateMarketScore,
  calculateImpactScore,
  calculateValueScore,
  calculateRecommendation,
  calculateAllScores,
  getMatrixPosition,
  type CalculatedScores,
} from '@/lib/scoring';
import { FormData } from '@/app/form/page';

// Test data generator for consistent testing
const createTestData = (overrides: Partial<FormData> = {}): FormData => ({
  reviewer: 'Test Reviewer',
  technologyId: 'TEST-001',
  inventorsTitle: 'Test Inventor',
  domainAssetClass: 'Medical Device',
  technologyOverview: 'Test technology',
  missionAlignmentText: 'Test mission text',
  missionAlignmentScore: 0,
  unmetNeedText: 'Test need text',
  unmetNeedScore: 0,
  stateOfArtText: 'Test art text',
  stateOfArtScore: 0,
  marketOverview: 'Test market text',
  marketSizeScore: 0,
  patientPopulationScore: 0,
  competitorsScore: 0,
  competitors: [],
  digitalQuestion1: false,
  digitalQuestion2: false,
  digitalQuestion3: false,
  digitalQuestion4: false,
  digitalScore: 0,
  summaryText: 'Test summary',
  subjectMatterExperts: [],
  ...overrides,
});

describe('Scoring Engine Integration Tests', () => {
  describe('Market Score Calculation', () => {
    test('calculates correct average from three market sub-criteria', () => {
      const testData = createTestData({
        marketSizeScore: 3.0,
        patientPopulationScore: 2.0,
        competitorsScore: 1.0,
      });

      const marketScore = calculateMarketScore(testData);
      // (3.0 + 2.0 + 1.0) / 3 = 2.0
      expect(marketScore).toBe(2.0);
    });

    test('handles decimal precision correctly', () => {
      const testData = createTestData({
        marketSizeScore: 2.5,
        patientPopulationScore: 1.8,
        competitorsScore: 2.2,
      });

      const marketScore = calculateMarketScore(testData);
      // (2.5 + 1.8 + 2.2) / 3 = 2.1666... rounded to 2.17
      expect(marketScore).toBe(2.17);
    });

    test('handles edge case with all zero scores', () => {
      const testData = createTestData({
        marketSizeScore: 0,
        patientPopulationScore: 0,
        competitorsScore: 0,
      });

      const marketScore = calculateMarketScore(testData);
      expect(marketScore).toBe(0);
    });

    test('handles missing market scores with defaults', () => {
      const testData = createTestData(); // All undefined, should default to 0

      const marketScore = calculateMarketScore(testData);
      expect(marketScore).toBe(0);
    });
  });

  describe('Impact Score Calculation', () => {
    test('calculates weighted average of mission alignment and unmet need', () => {
      const testData = createTestData({
        missionAlignmentScore: 3.0,
        unmetNeedScore: 2.0,
      });

      const impactScore = calculateImpactScore(testData);
      // (3.0 * 0.5) + (2.0 * 0.5) = 1.5 + 1.0 = 2.5
      expect(impactScore).toBe(2.5);
    });

    test('maintains precision with decimal scores', () => {
      const testData = createTestData({
        missionAlignmentScore: 2.7,
        unmetNeedScore: 1.9,
      });

      const impactScore = calculateImpactScore(testData);
      // (2.7 * 0.5) + (1.9 * 0.5) = 1.35 + 0.95 = 2.3
      expect(impactScore).toBe(2.3);
    });
  });

  describe('Value Score Calculation', () => {
    test('calculates weighted average of state of art and market scores', () => {
      const testData = createTestData({
        stateOfArtScore: 2.0,
        marketSizeScore: 3.0,
        patientPopulationScore: 3.0,
        competitorsScore: 3.0,
      });

      const valueScore = calculateValueScore(testData);
      // Market: (3.0 + 3.0 + 3.0) / 3 = 3.0
      // Value: (2.0 * 0.5) + (3.0 * 0.5) = 1.0 + 1.5 = 2.5
      expect(valueScore).toBe(2.5);
    });

    test('integrates market calculation correctly', () => {
      const testData = createTestData({
        stateOfArtScore: 1.5,
        marketSizeScore: 2.5,
        patientPopulationScore: 1.5,
        competitorsScore: 2.0,
      });

      const valueScore = calculateValueScore(testData);
      // Market: (2.5 + 1.5 + 2.0) / 3 = 2.0
      // Value: (1.5 * 0.5) + (2.0 * 0.5) = 0.75 + 1.0 = 1.75
      expect(valueScore).toBe(1.75);
    });
  });

  describe('Recommendation Matrix Logic', () => {
    test('returns "Proceed" for high impact and high value', () => {
      const recommendation = calculateRecommendation(2.5, 2.0);
      expect(recommendation).toBe('Proceed');
    });

    test('returns "Alternative Pathway" for high impact, low value', () => {
      const recommendation = calculateRecommendation(2.0, 1.0);
      expect(recommendation).toBe('Alternative Pathway');
    });

    test('returns "Alternative Pathway" for low impact, high value', () => {
      const recommendation = calculateRecommendation(1.0, 2.0);
      expect(recommendation).toBe('Alternative Pathway');
    });

    test('returns "Close" for low impact and low value', () => {
      const recommendation = calculateRecommendation(1.0, 1.0);
      expect(recommendation).toBe('Close');
    });

    test('returns "N/A" for zero scores', () => {
      const recommendation = calculateRecommendation(0, 0);
      expect(recommendation).toBe('N/A');
    });

    test('handles boundary conditions at 1.5 threshold', () => {
      // Exactly at threshold should be "Proceed"
      expect(calculateRecommendation(1.5, 1.5)).toBe('Proceed');

      // Just below threshold
      expect(calculateRecommendation(1.49, 1.5)).toBe('Alternative Pathway');
      expect(calculateRecommendation(1.5, 1.49)).toBe('Alternative Pathway');
      expect(calculateRecommendation(1.49, 1.49)).toBe('Close');
    });
  });

  describe('Complete Integration - calculateAllScores', () => {
    test('produces correct scores matching original Excel scorecard example', () => {
      // Test data that matches the PDF example scenario
      const testData = createTestData({
        missionAlignmentScore: 3.0,
        unmetNeedScore: 3.0,
        stateOfArtScore: 2.0,
        marketSizeScore: 3.0,
        patientPopulationScore: 2.0,
        competitorsScore: 2.0,
      });

      const scores = calculateAllScores(testData);

      // Market: (3.0 + 2.0 + 2.0) / 3 = 2.33
      expect(scores.marketScore).toBe(2.33);

      // Impact: (3.0 * 0.5) + (3.0 * 0.5) = 3.0
      expect(scores.impactScore).toBe(3.0);

      // Value: (2.0 * 0.5) + (2.33 * 0.5) = 1.0 + 1.165 = 2.17
      expect(scores.valueScore).toBe(2.17);

      // Recommendation: High impact (3.0 >= 1.5) and high value (2.17 >= 1.5)
      expect(scores.recommendation).toBe('Proceed');
    });

    test('handles realistic pharmaceutical company scenario', () => {
      const pharmaData = createTestData({
        missionAlignmentScore: 3.0, // Strong child health alignment
        unmetNeedScore: 2.5,        // Significant clinical need
        stateOfArtScore: 1.5,       // Some existing treatments
        marketSizeScore: 3.0,       // Large market opportunity
        patientPopulationScore: 2.5, // Substantial patient population
        competitorsScore: 1.5,      // Moderate competition
      });

      const scores = calculateAllScores(pharmaData);

      // Market: (3.0 + 2.5 + 1.5) / 3 = 2.33
      expect(scores.marketScore).toBe(2.33);

      // Impact: (3.0 * 0.5) + (2.5 * 0.5) = 2.75
      expect(scores.impactScore).toBe(2.75);

      // Value: (1.5 * 0.5) + (2.33 * 0.5) = 1.92
      expect(scores.valueScore).toBe(1.92);

      // Both above 1.5 threshold
      expect(scores.recommendation).toBe('Proceed');
    });

    test('handles early-stage research scenario', () => {
      const researchData = createTestData({
        missionAlignmentScore: 1.5, // Potential but unproven
        unmetNeedScore: 2.0,        // Clear need identified
        stateOfArtScore: 0.5,       // Novel approach
        marketSizeScore: 1.0,       // Uncertain market size
        patientPopulationScore: 1.5, // Limited population data
        competitorsScore: 2.0,      // Few direct competitors
      });

      const scores = calculateAllScores(researchData);

      // Market: (1.0 + 1.5 + 2.0) / 3 = 1.5
      expect(scores.marketScore).toBe(1.5);

      // Impact: (1.5 * 0.5) + (2.0 * 0.5) = 1.75
      expect(scores.impactScore).toBe(1.75);

      // Value: (0.5 * 0.5) + (1.5 * 0.5) = 1.0
      expect(scores.valueScore).toBe(1.0);

      // High impact (1.75 >= 1.5) but low value (1.0 < 1.5)
      expect(scores.recommendation).toBe('Alternative Pathway');
    });
  });

  describe('Matrix Position Calculation', () => {
    test('correctly maps scores to matrix coordinates', () => {
      // Test various score combinations
      expect(getMatrixPosition(0, 0)).toEqual({ x: 0, y: 0 });
      expect(getMatrixPosition(3, 3)).toEqual({ x: 3, y: 3 });
      expect(getMatrixPosition(1.5, 1.5)).toEqual({ x: 1.5, y: 1.5 });

      // Test boundary handling
      expect(getMatrixPosition(-1, 4)).toEqual({ x: 0, y: 3 }); // Clamps to valid range
    });

    test('produces coordinates that match visual matrix quadrants', () => {
      // Test positions that should land in different quadrants
      const lowLow = getMatrixPosition(0.5, 0.5);     // Close quadrant
      const highLow = getMatrixPosition(2.5, 0.5);    // Alternative pathway
      const lowHigh = getMatrixPosition(0.5, 2.5);    // Alternative pathway
      const highHigh = getMatrixPosition(2.5, 2.5);   // Proceed quadrant

      expect(lowLow.x).toBeLessThan(1.5);
      expect(lowLow.y).toBeLessThan(1.5);

      expect(highHigh.x).toBeGreaterThan(1.5);
      expect(highHigh.y).toBeGreaterThan(1.5);
    });
  });
});

describe('Data Validation and Edge Cases', () => {
  test('handles invalid score inputs gracefully', () => {
    const invalidData = createTestData({
      missionAlignmentScore: NaN,
      unmetNeedScore: -1,
      stateOfArtScore: 5, // Above maximum
      marketSizeScore: undefined as any,
    });

    const scores = calculateAllScores(invalidData);

    // Should handle gracefully without crashing
    expect(typeof scores.impactScore).toBe('number');
    expect(typeof scores.valueScore).toBe('number');
    expect(typeof scores.marketScore).toBe('number');
    expect(['Proceed', 'Alternative Pathway', 'Close', 'N/A']).toContain(scores.recommendation);
  });

  test('maintains consistency across multiple calculation runs', () => {
    const testData = createTestData({
      missionAlignmentScore: 2.5,
      unmetNeedScore: 2.0,
      stateOfArtScore: 1.8,
      marketSizeScore: 2.2,
      patientPopulationScore: 1.9,
      competitorsScore: 2.1,
    });

    // Run calculation multiple times
    const results = Array.from({ length: 10 }, () => calculateAllScores(testData));

    // All results should be identical
    const firstResult = results[0];
    results.forEach(result => {
      expect(result).toEqual(firstResult);
    });
  });

  test('precision is maintained through calculation chain', () => {
    const testData = createTestData({
      missionAlignmentScore: 2.333,
      unmetNeedScore: 1.667,
      stateOfArtScore: 2.111,
      marketSizeScore: 1.889,
      patientPopulationScore: 2.444,
      competitorsScore: 1.556,
    });

    const scores = calculateAllScores(testData);

    // Verify all scores are properly rounded to 2 decimal places
    expect(scores.impactScore.toString()).toMatch(/^\d+\.\d{1,2}$/);
    expect(scores.valueScore.toString()).toMatch(/^\d+\.\d{1,2}$/);
    expect(scores.marketScore.toString()).toMatch(/^\d+\.\d{1,2}$/);

    // Verify calculations are mathematically correct
    const expectedMarket = Number(((1.889 + 2.444 + 1.556) / 3).toFixed(2));
    const expectedImpact = Number(((2.333 + 1.667) / 2).toFixed(2));
    const expectedValue = Number(((2.111 + expectedMarket) / 2).toFixed(2));

    expect(scores.marketScore).toBe(expectedMarket);
    expect(scores.impactScore).toBe(expectedImpact);
    expect(scores.valueScore).toBe(expectedValue);
  });
});