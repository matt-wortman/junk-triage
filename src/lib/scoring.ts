import { FormData } from "@/app/form/page";

export interface CalculatedScores {
  impactScore: number;
  valueScore: number;
  marketScore: number;
  recommendation: "Proceed" | "Alternative Pathway" | "Close" | "N/A";
}

/**
 * Calculate the overall market score based on sub-criteria
 * Formula: Average of Market Size, Patient Population, and Competitors scores
 */
export function calculateMarketScore(data: FormData): number {
  const { marketSizeScore = 0, patientPopulationScore = 0, competitorsScore = 0 } = data;
  return Number(((marketSizeScore + patientPopulationScore + competitorsScore) / 3).toFixed(2));
}

/**
 * Calculate the Impact score based on Mission Alignment and Unmet Need
 * Formula: (Mission Alignment * 50%) + (Unmet Need * 50%)
 */
export function calculateImpactScore(data: FormData): number {
  const { missionAlignmentScore = 0, unmetNeedScore = 0 } = data;
  return Number(((missionAlignmentScore * 0.5) + (unmetNeedScore * 0.5)).toFixed(2));
}

/**
 * Calculate the Value score based on State of Art and Market scores
 * Formula: (State of Art * 50%) + (Market * 50%)
 */
export function calculateValueScore(data: FormData): number {
  const { stateOfArtScore = 0 } = data;
  const marketScore = calculateMarketScore(data);
  return Number(((stateOfArtScore * 0.5) + (marketScore * 0.5)).toFixed(2));
}

/**
 * Determine recommendation based on Impact vs Value matrix
 * Based on the matrix from the PDF:
 * - Impact ≥ 1.5 AND Value ≥ 1.5: Proceed
 * - Impact ≥ 1.5 AND Value < 1.5: Alternative Pathway
 * - Impact < 1.5 AND Value ≥ 1.5: Alternative Pathway
 * - Impact < 1.5 AND Value < 1.5: Close
 */
export function calculateRecommendation(impactScore: number, valueScore: number): "Proceed" | "Alternative Pathway" | "Close" | "N/A" {
  if (impactScore >= 1.5 && valueScore >= 1.5) {
    return "Proceed";
  } else if (impactScore >= 1.5 || valueScore >= 1.5) {
    return "Alternative Pathway";
  } else if (impactScore > 0 && valueScore > 0) {
    return "Close";
  } else {
    return "N/A";
  }
}

/**
 * Calculate all scores and recommendation
 */
export function calculateAllScores(data: FormData): CalculatedScores {
  const marketScore = calculateMarketScore(data);
  const impactScore = calculateImpactScore(data);
  const valueScore = calculateValueScore(data);
  const recommendation = calculateRecommendation(impactScore, valueScore);

  return {
    impactScore,
    valueScore,
    marketScore,
    recommendation
  };
}

/**
 * Get the matrix position for the Impact vs Value chart
 */
export function getMatrixPosition(impactScore: number, valueScore: number): { x: number; y: number } {
  // Scale to 0-3 range for the chart
  const x = Math.max(0, Math.min(3, impactScore));
  const y = Math.max(0, Math.min(3, valueScore));

  return { x, y };
}