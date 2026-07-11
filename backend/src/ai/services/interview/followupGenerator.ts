// backend/src/ai/services/interview/followupGenerator.ts
//
// Follow-up Generator Service — the smartest AI component in the interview engine.
//
// Instead of blindly asking another prepared question, this service:
//   1. Inspects the candidate's answer for quality signals
//   2. Identifies specific weaknesses (missing concepts, vagueness, contradictions)
//   3. Decides whether to drill deeper OR advance to the next planned question
//   4. If drilling, generates a laser-focused follow-up targeting the identified weakness
//
// This is what separates a PrepGenie interview from a simple Q&A chatbot.

import { callStructuredAI } from '../structuredOutput';
import { buildFollowUpPrompt } from '../../prompts/interview/prompts';
import { AI_MODELS } from '../../core/models';
import { logger } from '../../../core/logger';
import type {
  ConversationContext,
  GeneratedQuestion,
  FollowUpDecision,
  FollowUpTrigger,
  InterviewDifficulty,
} from '../../../features/mockInterview/types';

function validateFollowUpDecision(data: any): FollowUpDecision {
  if (!data || typeof data !== 'object') {
    throw new Error('Follow-up response must be a JSON object');
  }

  const shouldFollowUp = Boolean(data.shouldFollowUp);
  const trigger = (data.trigger as FollowUpTrigger) || 'none';
  const reasoning = String(data.reasoning || '');

  let generatedQuestion: GeneratedQuestion | undefined;

  if (shouldFollowUp && data.generatedQuestion) {
    const q = data.generatedQuestion;
    generatedQuestion = {
      questionText: String(q.questionText || ''),
      category: String(q.category || 'Follow-up'),
      difficulty: (q.difficulty as InterviewDifficulty) || 'MEDIUM',
      expectedSkills: Array.isArray(q.expectedSkills)
        ? q.expectedSkills.map(String)
        : [],
      estimatedTimeSec: Number(q.estimatedTimeSec || 90),
      followUpAllowed: false, // follow-ups don't recurse by default
      isFollowUp: true,
    };
  }

  return {
    shouldFollowUp,
    trigger,
    generatedQuestion,
    reasoning,
  };
}

/**
 * Evaluates a candidate's answer and decides whether a follow-up is needed.
 *
 * Returns a FollowUpDecision with:
 * - shouldFollowUp: false → caller should advance to next planned question
 * - shouldFollowUp: true  → caller should ask the generatedQuestion as follow-up
 */
export async function evaluateForFollowUp(
  question: GeneratedQuestion,
  candidateAnswer: string,
  context: ConversationContext
): Promise<FollowUpDecision> {
  // Hard limit: never exceed persona's follow-up depth
  const maxDepth = context.persona?.followUpDepth ?? 2;
  if (context.followUpChainDepth >= maxDepth) {
    logger.info('[followupGenerator] Follow-up chain at max depth, skipping', {
      category: 'interview',
      sessionId: context.sessionId,
      depth: context.followUpChainDepth,
      maxDepth,
    });
    return {
      shouldFollowUp: false,
      trigger: 'none',
      reasoning: 'Maximum follow-up depth reached for this question.',
    };
  }

  // Skip follow-up evaluation if follow-ups are disabled for this question
  if (!question.followUpAllowed) {
    return {
      shouldFollowUp: false,
      trigger: 'none',
      reasoning: 'Follow-up not allowed for this question type.',
    };
  }

  logger.info('[followupGenerator] Evaluating answer for follow-up', {
    category: 'interview',
    sessionId: context.sessionId,
    answerLength: candidateAnswer.length,
    chainDepth: context.followUpChainDepth,
  });

  const messages = buildFollowUpPrompt(question, candidateAnswer, context);

  const result = await callStructuredAI(messages, validateFollowUpDecision, {
    model: AI_MODELS.FAST_TEXT, // Use fast model — follow-ups need to be snappy
    temperature: 0.3,
    maxTokens: 600,
    maxRetries: 1,
  });

  logger.info('[followupGenerator] Follow-up decision made', {
    category: 'interview',
    shouldFollowUp: result.data.shouldFollowUp,
    trigger: result.data.trigger,
    latency: result.latency,
  });

  return result.data;
}
