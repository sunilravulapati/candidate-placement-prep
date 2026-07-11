// backend/src/ai/services/interview/scoreCalculator.ts
//
// Score Calculator — DETERMINISTIC, no AI required.
// Aggregates per-question EvaluationResult[] into a session-level ScoreResult.
// Computes improvement trend and confidence trend from the evaluation history.

import { logger } from '../../../core/logger';
import type {
  EvaluationResult,
  ScoreResult,
  DimensionScores,
  ImprovementTrend,
  ConfidenceTrend,
} from '../../../features/mockInterview/types';

type DimensionKey = keyof DimensionScores;

const DIMENSION_WEIGHTS: Record<DimensionKey, number> = {
  technicalAccuracy: 0.25,
  communication: 0.15,
  problemSolving: 0.20,
  confidence: 0.05,
  depth: 0.15,
  structure: 0.08,
  examples: 0.07,
  completeness: 0.05,
};

/**
 * Computes weighted average for a single dimension across all evaluations.
 */
function avgDimension(
  evaluations: EvaluationResult[],
  dimension: DimensionKey
): number {
  if (evaluations.length === 0) return 0;
  const sum = evaluations.reduce((acc, e) => acc + e.scores[dimension], 0);
  return Math.round(sum / evaluations.length);
}

/**
 * Computes improvement trend by comparing early vs late question performance.
 */
function computeImprovementTrend(
  evaluations: EvaluationResult[]
): ImprovementTrend {
  if (evaluations.length < 2) {
    return {
      earlyAvg: evaluations[0]?.overallScore ?? 0,
      lateAvg: evaluations[0]?.overallScore ?? 0,
      delta: 0,
      label: 'stable',
    };
  }

  const midpoint = Math.ceil(evaluations.length / 2);
  const early = evaluations.slice(0, midpoint);
  const late = evaluations.slice(midpoint);

  const earlyAvg = Math.round(
    early.reduce((s, e) => s + e.overallScore, 0) / early.length
  );
  const lateAvg = Math.round(
    late.reduce((s, e) => s + e.overallScore, 0) / late.length
  );
  const delta = lateAvg - earlyAvg;

  let label: 'improving' | 'stable' | 'declining';
  if (delta >= 5) label = 'improving';
  else if (delta <= -5) label = 'declining';
  else label = 'stable';

  return { earlyAvg, lateAvg, delta, label };
}

/**
 * Computes confidence trend from per-question confidence scores.
 */
function computeConfidenceTrend(
  evaluations: EvaluationResult[]
): ConfidenceTrend {
  const scores = evaluations.map(e => e.scores.confidence);
  if (scores.length === 0) {
    return { scores: [], trend: 'stable', peak: 0, low: 0 };
  }

  const peak = Math.max(...scores);
  const low = Math.min(...scores);
  const first = scores[0];
  const last = scores[scores.length - 1];
  const diff = last - first;

  let trend: 'rising' | 'stable' | 'falling';
  if (diff >= 8) trend = 'rising';
  else if (diff <= -8) trend = 'falling';
  else trend = 'stable';

  return { scores, trend, peak, low };
}

/**
 * Calculates the overall weighted score from dimension averages.
 */
function calculateWeightedOverall(dimensions: DimensionScores): number {
  let total = 0;
  for (const [dim, weight] of Object.entries(DIMENSION_WEIGHTS)) {
    total += dimensions[dim as DimensionKey] * weight;
  }
  return Math.round(total);
}

/**
 * Aggregates all per-question evaluations into a session-level ScoreResult.
 * No AI calls — fully deterministic computation.
 */
export function calculateSessionScore(
  evaluations: EvaluationResult[]
): ScoreResult {
  logger.info('[scoreCalculator] Calculating session score', {
    category: 'interview',
    evaluationCount: evaluations.length,
  });

  if (evaluations.length === 0) {
    const empty: DimensionScores = {
      technicalAccuracy: 0,
      communication: 0,
      problemSolving: 0,
      confidence: 0,
      depth: 0,
      structure: 0,
      examples: 0,
      completeness: 0,
    };
    return {
      dimensions: empty,
      overallScore: 0,
      improvementTrend: { earlyAvg: 0, lateAvg: 0, delta: 0, label: 'stable' },
      confidenceTrend: { scores: [], trend: 'stable', peak: 0, low: 0 },
    };
  }

  const dimensions: DimensionScores = {
    technicalAccuracy: avgDimension(evaluations, 'technicalAccuracy'),
    communication: avgDimension(evaluations, 'communication'),
    problemSolving: avgDimension(evaluations, 'problemSolving'),
    confidence: avgDimension(evaluations, 'confidence'),
    depth: avgDimension(evaluations, 'depth'),
    structure: avgDimension(evaluations, 'structure'),
    examples: avgDimension(evaluations, 'examples'),
    completeness: avgDimension(evaluations, 'completeness'),
  };

  const overallScore = calculateWeightedOverall(dimensions);
  const improvementTrend = computeImprovementTrend(evaluations);
  const confidenceTrend = computeConfidenceTrend(evaluations);

  logger.info('[scoreCalculator] Score calculated', {
    category: 'interview',
    overallScore,
    improvementTrend: improvementTrend.label,
  });

  return {
    dimensions,
    overallScore,
    improvementTrend,
    confidenceTrend,
  };
}
