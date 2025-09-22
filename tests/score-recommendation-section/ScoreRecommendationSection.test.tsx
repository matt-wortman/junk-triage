/**
 * Functional Tests for ScoreRecommendationSection Component
 *
 * These tests validate actual functionality that users depend on:
 * - Table structure and hierarchy display
 * - Score calculations and formatting
 * - Auto-calculation engine integration
 * - Visual indicators and accessibility
 * - Real-world data scenarios
 */

import { render, screen } from '@testing-library/react';
import { ScoreRecommendationSection } from '@/components/form/ScoreRecommendationSection';
import { FormData } from '@/app/form/page';
import '@testing-library/jest-dom';

// Test data scenarios that match real-world usage
const createMockFormData = (overrides: Partial<FormData> = {}): FormData => ({
  // Header section
  reviewer: 'Dr. Test Reviewer',
  technologyId: 'TEST-001',
  inventorsTitle: 'Test Inventor',
  domainAssetClass: 'Medical Device',

  // Technology overview
  technologyOverview: 'Test technology description',

  // Mission alignment
  missionAlignmentText: 'Test mission alignment text',
  missionAlignmentScore: 2.5,

  // Unmet need
  unmetNeedText: 'Test unmet need text',
  unmetNeedScore: 3.0,

  // State of the art
  stateOfArtText: 'Test state of art text',
  stateOfArtScore: 2.0,

  // Market analysis with realistic scores
  marketOverview: 'Test market overview',
  marketSizeScore: 3.0,
  patientPopulationScore: 2.5,
  competitorsScore: 1.5,
  competitors: [],

  // Digital considerations
  digitalQuestion1: true,
  digitalQuestion2: false,
  digitalQuestion3: true,
  digitalQuestion4: false,
  digitalScore: 2,

  // Summary
  summaryText: 'Test summary',
  subjectMatterExperts: [],

  // Apply any overrides
  ...overrides,
});

const mockUpdateData = jest.fn();

describe('ScoreRecommendationSection - Table Structure', () => {
  beforeEach(() => {
    mockUpdateData.mockClear();
  });

  test('displays proper table hierarchy with IMPACT and VALUE sections', () => {
    const formData = createMockFormData();
    render(<ScoreRecommendationSection data={formData} updateData={mockUpdateData} />);

    // Verify section headers are present and properly labeled
    const impactHeader = screen.getByRole('cell', { name: /IMPACT/i });
    const valueHeader = screen.getByRole('cell', { name: /VALUE/i });

    expect(impactHeader).toBeInTheDocument();
    expect(valueHeader).toBeInTheDocument();

    // Verify section headers have proper accessibility attributes
    expect(impactHeader.closest('tr')).toHaveAttribute('aria-label', 'Impact scoring criteria');
    expect(valueHeader.closest('tr')).toHaveAttribute('aria-label', 'Value scoring criteria');
  });

  test('displays all scoring criteria in correct sections', () => {
    const formData = createMockFormData();
    render(<ScoreRecommendationSection data={formData} updateData={mockUpdateData} />);

    // IMPACT criteria
    expect(screen.getByRole('cell', { name: 'Mission Alignment' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Unmet Need' })).toBeInTheDocument();

    // VALUE criteria
    expect(screen.getByRole('cell', { name: 'State of the Art' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Market' })).toBeInTheDocument();
  });

  test('displays market sub-criteria with proper indentation', () => {
    const formData = createMockFormData();
    render(<ScoreRecommendationSection data={formData} updateData={mockUpdateData} />);

    // Market sub-criteria should be present
    expect(screen.getByRole('cell', { name: /Market Size.*TAM/i })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: /Patient Population/i })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: /Direct\/Indirect Competitors/i })).toBeInTheDocument();

    // Verify sub-criteria have visual indicators (bullets)
    const marketSizeCell = screen.getByRole('cell', { name: /Market Size.*TAM/i });
    expect(marketSizeCell).toHaveClass('pl-10'); // Proper indentation
  });

  test('displays summary scores with proper formatting', () => {
    const formData = createMockFormData();
    render(<ScoreRecommendationSection data={formData} updateData={mockUpdateData} />);

    // Impact Score = (2.5 * 0.5) + (3.0 * 0.5) = 2.75
    expect(screen.getByRole('cell', { name: 'Impact Score' })).toBeInTheDocument();
    expect(screen.getByText('2.75')).toBeInTheDocument();

    // Value Score = (2.0 * 0.5) + (2.33 * 0.5) = 2.17 (market avg = (3.0+2.5+1.5)/3 = 2.33)
    expect(screen.getByRole('cell', { name: 'Value Score' })).toBeInTheDocument();
    expect(screen.getByText('2.17')).toBeInTheDocument();
  });
});

describe('ScoreRecommendationSection - Score Calculations', () => {
  test('correctly calculates and displays individual weighted scores', () => {
    const formData = createMockFormData({
      missionAlignmentScore: 3.0,
      unmetNeedScore: 2.0,
      stateOfArtScore: 1.5,
      marketSizeScore: 2.0,
      patientPopulationScore: 2.0,
      competitorsScore: 2.0,
    });

    render(<ScoreRecommendationSection data={formData} updateData={mockUpdateData} />);

    // Mission Alignment: 3.0 * 50% = 1.50
    const missionRow = screen.getByRole('cell', { name: 'Mission Alignment' }).closest('tr');
    expect(missionRow).toHaveTextContent('3.00');
    expect(missionRow).toHaveTextContent('50%');
    expect(missionRow).toHaveTextContent('1.50');

    // Unmet Need: 2.0 * 50% = 1.00
    const needRow = screen.getByRole('cell', { name: 'Unmet Need' }).closest('tr');
    expect(needRow).toHaveTextContent('2.00');
    expect(needRow).toHaveTextContent('1.00');

    // State of Art: 1.5 * 50% = 0.75
    const artRow = screen.getByRole('cell', { name: 'State of the Art' }).closest('tr');
    expect(artRow).toHaveTextContent('1.50');
    expect(artRow).toHaveTextContent('0.75');

    // Market: 2.0 * 50% = 1.00 (all market scores are 2.0, so average is 2.0)
    const marketRow = screen.getByRole('cell', { name: 'Market' }).closest('tr');
    expect(marketRow).toHaveTextContent('2.00');
    expect(marketRow).toHaveTextContent('1.00');
  });

  test('handles edge cases: zero scores', () => {
    const formData = createMockFormData({
      missionAlignmentScore: 0,
      unmetNeedScore: 0,
      stateOfArtScore: 0,
      marketSizeScore: 0,
      patientPopulationScore: 0,
      competitorsScore: 0,
    });

    render(<ScoreRecommendationSection data={formData} updateData={mockUpdateData} />);

    // All scores should display as 0.00
    const rows = screen.getAllByText('0.00');
    expect(rows.length).toBeGreaterThan(5); // Multiple score fields should show 0.00

    // Summary scores should be 0.00
    expect(screen.getByText('0.00')).toBeInTheDocument();
  });

  test('handles edge cases: undefined scores', () => {
    const formData = createMockFormData({
      missionAlignmentScore: undefined as any,
      unmetNeedScore: undefined as any,
      stateOfArtScore: undefined as any,
      marketSizeScore: undefined as any,
      patientPopulationScore: undefined as any,
      competitorsScore: undefined as any,
    });

    render(<ScoreRecommendationSection data={formData} updateData={mockUpdateData} />);

    // Should gracefully handle undefined and display 0.00
    const zeroScores = screen.getAllByText('0.00');
    expect(zeroScores.length).toBeGreaterThan(0);
  });

  test('handles edge cases: maximum scores', () => {
    const formData = createMockFormData({
      missionAlignmentScore: 3.0,
      unmetNeedScore: 3.0,
      stateOfArtScore: 3.0,
      marketSizeScore: 3.0,
      patientPopulationScore: 3.0,
      competitorsScore: 3.0,
    });

    render(<ScoreRecommendationSection data={formData} updateData={mockUpdateData} />);

    // Impact Score = (3.0 * 0.5) + (3.0 * 0.5) = 3.00
    expect(screen.getByText('3.00')).toBeInTheDocument();

    // All individual scores should show 3.00
    const maxScores = screen.getAllByText('3.00');
    expect(maxScores.length).toBeGreaterThan(3);
  });
});

describe('ScoreRecommendationSection - Auto-calculation Integration', () => {
  test('matrix position updates correctly based on calculated scores', () => {
    const formData = createMockFormData({
      missionAlignmentScore: 3.0,
      unmetNeedScore: 3.0,
      stateOfArtScore: 3.0,
      marketSizeScore: 3.0,
      patientPopulationScore: 3.0,
      competitorsScore: 3.0,
    });

    render(<ScoreRecommendationSection data={formData} updateData={mockUpdateData} />);

    // Should show "Proceed" recommendation for high scores
    expect(screen.getByText('Proceed')).toBeInTheDocument();

    // Verify the badge has the correct styling
    const proceedBadge = screen.getByText('Proceed');
    expect(proceedBadge).toHaveClass('bg-green-100', 'text-green-800');
  });

  test('recommendation changes based on different score combinations', () => {
    // Low impact, high value - should be Alternative Pathway
    const formData = createMockFormData({
      missionAlignmentScore: 1.0,
      unmetNeedScore: 1.0,
      stateOfArtScore: 3.0,
      marketSizeScore: 3.0,
      patientPopulationScore: 3.0,
      competitorsScore: 3.0,
    });

    render(<ScoreRecommendationSection data={formData} updateData={mockUpdateData} />);

    expect(screen.getByText('Alternative Pathway')).toBeInTheDocument();

    const altPathwayBadge = screen.getByText('Alternative Pathway');
    expect(altPathwayBadge).toHaveClass('bg-yellow-100', 'text-yellow-800');
  });

  test('displays current scores in matrix visualization', () => {
    const formData = createMockFormData({
      missionAlignmentScore: 2.5,
      unmetNeedScore: 2.0,
      stateOfArtScore: 1.5,
      marketSizeScore: 2.0,
      patientPopulationScore: 1.0,
      competitorsScore: 1.0,
    });

    render(<ScoreRecommendationSection data={formData} updateData={mockUpdateData} />);

    // Should display calculated scores in the matrix section
    // Impact: (2.5 * 0.5) + (2.0 * 0.5) = 2.25
    // Value: (1.5 * 0.5) + (1.33 * 0.5) = 1.42
    expect(screen.getByText('2.25')).toBeInTheDocument();
    expect(screen.getByText('1.42')).toBeInTheDocument();
  });
});

describe('ScoreRecommendationSection - Visual and Accessibility', () => {
  test('applies proper color coding to different sections', () => {
    const formData = createMockFormData();
    render(<ScoreRecommendationSection data={formData} updateData={mockUpdateData} />);

    // IMPACT section should have blue styling
    const impactHeader = screen.getByRole('cell', { name: /IMPACT/i }).closest('tr');
    expect(impactHeader).toHaveClass('bg-blue-100');

    // VALUE section should have green styling
    const valueHeader = screen.getByRole('cell', { name: /VALUE/i }).closest('tr');
    expect(valueHeader).toHaveClass('bg-green-100');
  });

  test('uses proper semantic markup for table structure', () => {
    const formData = createMockFormData();
    render(<ScoreRecommendationSection data={formData} updateData={mockUpdateData} />);

    // Table should have proper headers
    expect(screen.getByRole('columnheader', { name: /Criteria/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Score/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Weight/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Total/i })).toBeInTheDocument();

    // Criteria cells should have proper scope
    const criteriaRows = screen.getAllByRole('cell', { name: /Mission Alignment|Unmet Need|State of the Art|Market/i });
    criteriaRows.forEach(cell => {
      expect(cell).toHaveAttribute('scope', 'row');
    });
  });

  test('displays placeholder values for market sub-criteria weight/total columns', () => {
    const formData = createMockFormData();
    render(<ScoreRecommendationSection data={formData} updateData={mockUpdateData} />);

    // Market sub-criteria should show em dashes for weight and total
    const marketSizeRow = screen.getByRole('cell', { name: /Market Size.*TAM/i }).closest('tr');
    const emDashes = marketSizeRow?.querySelectorAll('td:nth-child(3), td:nth-child(4)');

    emDashes?.forEach(cell => {
      expect(cell).toHaveTextContent('—');
    });
  });
});

describe('ScoreRecommendationSection - Real-world Usage Scenarios', () => {
  test('pharmaceutical company evaluation scenario', () => {
    const pharmaData = createMockFormData({
      missionAlignmentScore: 3.0, // High child health impact
      unmetNeedScore: 2.5,        // Significant clinical need
      stateOfArtScore: 1.5,       // Some existing treatments
      marketSizeScore: 3.0,       // Large TAM
      patientPopulationScore: 2.0, // Moderate patient base
      competitorsScore: 2.0,      // Several competitors
    });

    render(<ScoreRecommendationSection data={pharmaData} updateData={mockUpdateData} />);

    // Should calculate realistic scores
    // Impact: (3.0 + 2.5) / 2 = 2.75
    // Value: (1.5 + 2.33) / 2 = 1.92
    expect(screen.getByText('2.75')).toBeInTheDocument(); // Impact
    expect(screen.getByText('1.92')).toBeInTheDocument(); // Value
    expect(screen.getByText('Proceed')).toBeInTheDocument(); // Recommendation
  });

  test('medical device startup scenario', () => {
    const startupData = createMockFormData({
      missionAlignmentScore: 2.0, // Moderate alignment
      unmetNeedScore: 3.0,        // High unmet need
      stateOfArtScore: 2.5,       // Some prior art
      marketSizeScore: 1.5,       // Smaller market
      patientPopulationScore: 1.0, // Niche population
      competitorsScore: 3.0,      // Few competitors
    });

    render(<ScoreRecommendationSection data={startupData} updateData={mockUpdateData} />);

    // Impact: (2.0 + 3.0) / 2 = 2.50
    // Market: (1.5 + 1.0 + 3.0) / 3 = 1.83
    // Value: (2.5 + 1.83) / 2 = 2.17
    expect(screen.getByText('2.50')).toBeInTheDocument(); // Impact
    expect(screen.getByText('2.17')).toBeInTheDocument(); // Value
    expect(screen.getByText('Proceed')).toBeInTheDocument(); // Recommendation
  });

  test('early-stage research scenario', () => {
    const researchData = createMockFormData({
      missionAlignmentScore: 1.5, // Lower current impact
      unmetNeedScore: 2.0,        // Some need identified
      stateOfArtScore: 0.5,       // Novel approach
      marketSizeScore: 1.0,       // Uncertain market
      patientPopulationScore: 1.5, // Limited population data
      competitorsScore: 1.0,      // Few known competitors
    });

    render(<ScoreRecommendationSection data={researchData} updateData={mockUpdateData} />);

    // Impact: (1.5 + 2.0) / 2 = 1.75
    // Market: (1.0 + 1.5 + 1.0) / 3 = 1.17
    // Value: (0.5 + 1.17) / 2 = 0.84
    expect(screen.getByText('1.75')).toBeInTheDocument(); // Impact
    expect(screen.getByText('0.84')).toBeInTheDocument(); // Value
    expect(screen.getByText('Alternative Pathway')).toBeInTheDocument(); // Recommendation
  });
});