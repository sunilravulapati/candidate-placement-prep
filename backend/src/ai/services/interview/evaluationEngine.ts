// backend/src/ai/services/interview/evaluationEngine.ts
//
// Evaluation Engine — evaluates each answer on 8 dimensions.
// Completely separate from conversation management.
// Called after the interview ends (or can be called incrementally).

import { callStructuredAI } from '../structuredOutput';
import { buildEvaluationPrompt } from '../../prompts/interview/prompts';
import { AI_MODELS } from '../../core/models';
import { logger } from '../../../core/logger';
import type {
  ConversationContext,
  GeneratedQuestion,
  EvaluationResult,
  DimensionScores,
} from '../../../features/mockInterview/types';

function validateEvaluationResult(data: any): DimensionScores & {
  overallScore: number;
  aiFeedback: string;
} {
  if (!data || typeof data !== 'object') {
    throw new Error('Evaluation response must be a JSON object');
  }

  const clamp = (v: any): number => Math.min(100, Math.max(0, Number(v) || 0));

  return {
    technicalAccuracy: clamp(data.technicalAccuracy),
    communication: clamp(data.communication),
    problemSolving: clamp(data.problemSolving),
    confidence: clamp(data.confidence),
    depth: clamp(data.depth),
    structure: clamp(data.structure),
    examples: clamp(data.examples),
    completeness: clamp(data.completeness),
    overallScore: clamp(data.overallScore),
    aiFeedback: typeof data.aiFeedback === 'object' ? JSON.stringify(data.aiFeedback) : String(data.aiFeedback || '{"finalRating": "Unable to evaluate"}'),
  };
}

/**
 * Evaluates a single question-answer pair on 8 dimensions.
 */
export async function evaluateAnswer(
  questionId: string,
  question: GeneratedQuestion,
  candidateAnswer: string,
  context: ConversationContext
): Promise<EvaluationResult> {
  logger.info('[evaluationEngine] Evaluating answer', {
    category: 'interview',
    sessionId: context.sessionId,
    questionId,
    answerLength: candidateAnswer.length,
  });

  const messages = buildEvaluationPrompt(question, candidateAnswer, context);

  const result = await callStructuredAI(messages, validateEvaluationResult, {
    model: AI_MODELS.DEFAULT_TEXT,
    temperature: 0.2, // low temp for consistent, calibrated scores
    maxTokens: 500,
    maxRetries: 2,
  });

  logger.info('[evaluationEngine] Evaluation complete', {
    category: 'interview',
    questionId,
    overallScore: result.data.overallScore,
    latency: result.latency,
  });

  const { overallScore, aiFeedback, ...scores } = result.data;

  return {
    questionId,
    scores,
    overallScore,
    aiFeedback,
  };
}

/**
 * Evaluates all answered questions in a session.
 * Runs sequentially to avoid rate limits.
 */
export async function evaluateAllAnswers(
  answeredPairs: Array<{
    questionId: string;
    question: GeneratedQuestion;
    answer: string;
  }>,
  context: ConversationContext
): Promise<EvaluationResult[]> {
  logger.info('[evaluationEngine] Starting batch evaluation', {
    category: 'interview',
    sessionId: context.sessionId,
    count: answeredPairs.length,
  });

  const results: EvaluationResult[] = [];

  for (const pair of answeredPairs) {
    try {
      const evaluation = await evaluateAnswer(
        pair.questionId,
        pair.question,
        pair.answer,
        context
      );
      results.push(evaluation);
    } catch (err) {
      logger.error('[evaluationEngine] Failed to evaluate question', err, {
        category: 'interview',
        questionId: pair.questionId,
      });
      // Insert fallback score rather than failing the entire pipeline
      results.push({
        questionId: pair.questionId,
        scores: {
          technicalAccuracy: 50,
          communication: 50,
          problemSolving: 50,
          confidence: 50,
          depth: 50,
          structure: 50,
          examples: 50,
          completeness: 50,
        },
        overallScore: 50,
        aiFeedback: JSON.stringify({
          strengths: [],
          weaknesses: [],
          missingConcepts: [],
          idealAnswer: 'Unable to retrieve answer due to timeout/error.',
          suggestedResponse: 'Please try again.',
          finalRating: 'Error'
        }),
      });
    }
  }

  return results;
}
