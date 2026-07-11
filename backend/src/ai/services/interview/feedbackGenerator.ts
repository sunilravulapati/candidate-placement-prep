// backend/src/ai/services/interview/feedbackGenerator.ts
//
// Feedback Generator — produces structured recruiter-grade session feedback.
// Called once after all evaluations are complete.
// Returns a JSON FeedbackResult (never markdown).

import { callStructuredAI } from '../structuredOutput';
import { buildFeedbackPrompt } from '../../prompts/interview/prompts';
import { AI_MODELS } from '../../core/models';
import { logger } from '../../../core/logger';
import type {
  InterviewConfig,
  InterviewPlan,
  EvaluationResult,
  FeedbackResult,
} from '../../../features/mockInterview/types';

function validateFeedbackResult(data: any): FeedbackResult {
  if (!data || typeof data !== 'object') {
    throw new Error('Feedback response must be a JSON object');
  }

  const toStringArray = (v: any): string[] =>
    Array.isArray(v) ? v.map(String).filter(Boolean) : [];

  return {
    strengths: toStringArray(data.strengths),
    weaknesses: toStringArray(data.weaknesses),
    missedConcepts: toStringArray(data.missedConcepts),
    suggestedImprovements: toStringArray(data.suggestedImprovements),
    topicsToRevise: toStringArray(data.topicsToRevise),
    recommendedDSAProblems: toStringArray(data.recommendedDSAProblems),
    resumeChanges: toStringArray(data.resumeChanges),
    overallSummary: String(data.overallSummary || 'Interview completed.'),
  };
}

/**
 * Generates comprehensive post-interview recruiter feedback.
 * Called once after EvaluationEngine completes all per-question scores.
 */
export async function generateFeedback(
  config: InterviewConfig,
  plan: InterviewPlan,
  evaluations: EvaluationResult[],
  overallScore: number
): Promise<FeedbackResult> {
  logger.info('[feedbackGenerator] Generating session feedback', {
    category: 'interview',
    evaluationCount: evaluations.length,
    overallScore,
  });

  const messages = buildFeedbackPrompt(config, plan, evaluations, overallScore);

  const result = await callStructuredAI(messages, validateFeedbackResult, {
    model: AI_MODELS.DEFAULT_TEXT,
    temperature: 0.35,
    maxTokens: 2000,
    maxRetries: 2,
  });

  logger.info('[feedbackGenerator] Feedback generated', {
    category: 'interview',
    strengthsCount: result.data.strengths.length,
    weaknessesCount: result.data.weaknesses.length,
    latency: result.latency,
  });

  return result.data;
}
