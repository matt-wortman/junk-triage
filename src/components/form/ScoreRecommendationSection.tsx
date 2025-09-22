import { FormData } from "@/app/form/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { calculateAllScores, getMatrixPosition } from "@/lib/scoring";
import { useMemo } from "react";

interface ScoreRecommendationSectionProps {
  data: FormData;
  updateData: (updates: Partial<FormData>) => void;
}

// Configuration constants
const SCORING_CONFIG = {
  WEIGHT_PERCENTAGE: 50,
  DECIMAL_PLACES: 2,
  MAX_SCORE: 3,
  MIN_SCORE: 0
} as const;

// Validation helper
function validateScore(score: number | undefined): number {
  if (score === undefined || isNaN(score)) return 0;
  return Math.max(SCORING_CONFIG.MIN_SCORE, Math.min(SCORING_CONFIG.MAX_SCORE, score));
}

// Format score with validation
function formatScore(score: number | undefined): string {
  return validateScore(score).toFixed(SCORING_CONFIG.DECIMAL_PLACES);
}

export function ScoreRecommendationSection({ data, updateData }: ScoreRecommendationSectionProps) {
  const scores = calculateAllScores(data);
  const matrixPosition = getMatrixPosition(scores.impactScore, scores.valueScore);

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case "Proceed":
        return "bg-green-100 text-green-800 border-green-300";
      case "Alternative Pathway":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "Close":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  // Memoized scoring data to prevent unnecessary recalculations
  const { impactCriteria, valueCriteria, marketSubCriteria } = useMemo(() => {
    const weightPercentage = `${SCORING_CONFIG.WEIGHT_PERCENTAGE}%`;
    const weightMultiplier = SCORING_CONFIG.WEIGHT_PERCENTAGE / 100;

    const impactCriteria = [
      {
        criteria: "Mission Alignment",
        score: formatScore(data.missionAlignmentScore),
        weight: weightPercentage,
        total: (validateScore(data.missionAlignmentScore) * weightMultiplier).toFixed(SCORING_CONFIG.DECIMAL_PLACES),
        category: "IMPACT" as const
      },
      {
        criteria: "Unmet Need",
        score: formatScore(data.unmetNeedScore),
        weight: weightPercentage,
        total: (validateScore(data.unmetNeedScore) * weightMultiplier).toFixed(SCORING_CONFIG.DECIMAL_PLACES),
        category: "IMPACT" as const
      }
    ];

    const valueCriteria = [
      {
        criteria: "State of the Art",
        score: formatScore(data.stateOfArtScore),
        weight: weightPercentage,
        total: (validateScore(data.stateOfArtScore) * weightMultiplier).toFixed(SCORING_CONFIG.DECIMAL_PLACES),
        category: "VALUE" as const
      },
      {
        criteria: "Market",
        score: scores.marketScore.toFixed(SCORING_CONFIG.DECIMAL_PLACES),
        weight: weightPercentage,
        total: (scores.marketScore * weightMultiplier).toFixed(SCORING_CONFIG.DECIMAL_PLACES),
        category: "VALUE" as const,
        hasSubCriteria: true
      }
    ];

    const marketSubCriteria = [
      {
        criteria: "Market Size – Revenue (TAM)",
        score: formatScore(data.marketSizeScore)
      },
      {
        criteria: "Patient Population",
        score: formatScore(data.patientPopulationScore)
      },
      {
        criteria: "# of Direct/Indirect Competitors",
        score: formatScore(data.competitorsScore)
      }
    ];

    return { impactCriteria, valueCriteria, marketSubCriteria };
  }, [data, scores.marketScore]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Score & Recommendation</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Automatically calculated scoring matrix based on all criteria entries. The overall Market score is calculated based on market sub-criteria.
        </p>
      </div>

      {/* Scoring Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Scoring Matrix</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Criteria</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* IMPACT Section Header */}
              <TableRow className="bg-blue-100" role="rowgroup" aria-label="Impact scoring criteria">
                <TableCell colSpan={4} className="font-bold text-blue-800 text-sm" scope="colgroup">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-blue-600 rounded-full" aria-hidden="true"></span>
                    IMPACT
                  </span>
                </TableCell>
              </TableRow>

              {/* IMPACT Criteria */}
              {impactCriteria.map((row, index) => (
                <TableRow key={`impact-${index}`} className="bg-blue-50">
                  <TableCell className="font-medium pl-6" scope="row">
                    {row.criteria}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{row.score}</TableCell>
                  <TableCell className="text-center">{row.weight}</TableCell>
                  <TableCell className="text-right tabular-nums font-medium">{row.total}</TableCell>
                </TableRow>
              ))}

              {/* VALUE Section Header */}
              <TableRow className="bg-green-100" role="rowgroup" aria-label="Value scoring criteria">
                <TableCell colSpan={4} className="font-bold text-green-800 text-sm" scope="colgroup">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-600 rounded-full" aria-hidden="true"></span>
                    VALUE
                  </span>
                </TableCell>
              </TableRow>

              {/* VALUE Criteria */}
              {valueCriteria.map((row, index) => (
                <TableRow key={`value-${index}`} className="bg-green-50">
                  <TableCell className="font-medium pl-6" scope="row">
                    {row.criteria}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{row.score}</TableCell>
                  <TableCell className="text-center">{row.weight}</TableCell>
                  <TableCell className="text-right tabular-nums font-medium">{row.total}</TableCell>
                </TableRow>
              ))}

              {/* Market Sub-criteria nested under Market */}
              {marketSubCriteria.map((subRow, index) => (
                <TableRow key={`market-sub-${index}`} className="bg-green-50/50">
                  <TableCell className="text-sm text-gray-600 pl-10" scope="row">
                    <span className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-gray-400 rounded-full" aria-hidden="true"></span>
                      {subRow.criteria}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 text-right tabular-nums">{subRow.score}</TableCell>
                  <TableCell className="text-sm text-gray-400 text-center">—</TableCell>
                  <TableCell className="text-sm text-gray-400 text-center">—</TableCell>
                </TableRow>
              ))}

              {/* Summary Scores */}
              <TableRow className="border-t-2 border-blue-200 bg-blue-100">
                <TableCell className="font-bold" scope="row">Impact Score</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell className="font-bold text-right tabular-nums">
                  {formatScore(scores.impactScore)}
                </TableCell>
              </TableRow>
              <TableRow className="border-t-2 border-green-200 bg-green-100">
                <TableCell className="font-bold" scope="row">Value Score</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell className="font-bold text-right tabular-nums">
                  {formatScore(scores.valueScore)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Impact vs Value Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Impact vs Value Matrix</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="relative bg-gray-50 p-8 rounded-lg">
            {/* Matrix Grid */}
            <div className="relative w-full h-64 border-2 border-gray-300">
              {/* Grid lines */}
              <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 border border-gray-200">
                {/* Quadrant Labels */}
                <div className="flex items-center justify-center bg-gray-100 text-xs font-medium text-gray-600">
                  N/A
                </div>
                <div className="flex items-center justify-center bg-blue-100 text-xs font-medium text-blue-800">
                  Proceed
                </div>
                <div className="flex items-center justify-center bg-red-100 text-xs font-medium text-red-800">
                  Close
                </div>
                <div className="flex items-center justify-center bg-yellow-100 text-xs font-medium text-yellow-800">
                  Alternative Pathway
                </div>
              </div>

              {/* Current Position Marker */}
              {scores.impactScore > 0 && scores.valueScore > 0 && (
                <div
                  className="absolute w-3 h-3 bg-primary rounded-full transform -translate-x-1/2 -translate-y-1/2 z-10"
                  style={{
                    left: `${(matrixPosition.x / 3) * 100}%`,
                    bottom: `${(matrixPosition.y / 3) * 100}%`,
                  }}
                />
              )}

              {/* Axis Labels */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm font-medium">
                IMPACT
              </div>
              <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 -rotate-90 text-sm font-medium">
                VALUE
              </div>

              {/* Scale Labels */}
              <div className="absolute -bottom-6 left-0 text-xs text-gray-500">0</div>
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500">1.5</div>
              <div className="absolute -bottom-6 right-0 text-xs text-gray-500">3</div>
              <div className="absolute -left-6 bottom-0 text-xs text-gray-500">0</div>
              <div className="absolute -left-6 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">1.5</div>
              <div className="absolute -left-6 top-0 text-xs text-gray-500">3</div>
            </div>
          </div>

          {/* Current Scores Display */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{scores.impactScore.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Impact Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{scores.valueScore.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Value Score</div>
            </div>
            <div className="text-center">
              <Badge className={`text-base px-4 py-2 ${getRecommendationColor(scores.recommendation)}`}>
                {scores.recommendation}
              </Badge>
              <div className="text-sm text-gray-600 mt-1">Recommendation</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}