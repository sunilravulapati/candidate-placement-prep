// backend/src/ai/services/interview/questionGenerator.ts
//
// Question Generator Service.
// Generates ONE question at a time, driven by the interview plan.
// Never generates multiple questions upfront.

import { callStructuredAI } from '../structuredOutput';
import { buildQuestionGeneratorPrompt } from '../../prompts/interview/prompts';
import { AI_MODELS } from '../../core/models';
import { logger } from '../../../core/logger';
import type {
  ConversationContext,
  GeneratedQuestion,
  InterviewDifficulty,
} from '../../../features/mockInterview/types';

function validateGeneratedQuestion(data: any): GeneratedQuestion {
  if (!data || typeof data !== 'object') {
    throw new Error('Question generator response must be a JSON object');
  }
  if (!data.questionText || typeof data.questionText !== 'string') {
    throw new Error('Question must have a questionText string');
  }

  return {
    questionText: String(data.questionText),
    category: String(data.category || 'General'),
    difficulty: (data.difficulty as InterviewDifficulty) || 'MEDIUM',
    expectedSkills: Array.isArray(data.expectedSkills)
      ? data.expectedSkills.map(String)
      : [],
    estimatedTimeSec: Number(data.estimatedTimeSec || 120),
    followUpAllowed: Boolean(data.followUpAllowed !== false),
    isFollowUp: false,
    parentQuestionId: undefined,
  };
}

/**
 * Generates the next planned interview question.
 * Called when the follow-up generator decides no follow-up is needed,
 * or for the very first question.
 */
export async function generateNextQuestion(
  context: ConversationContext,
  questionIndex: number
): Promise<GeneratedQuestion> {
  logger.info('[questionGenerator] Generating question', {
    category: 'interview',
    sessionId: context.sessionId,
    questionIndex,
    remainingTopics: context.remainingTopics.length,
  });

  const messages = buildQuestionGeneratorPrompt(context, questionIndex);

  const result = await callStructuredAI(messages, validateGeneratedQuestion, {
    model: AI_MODELS.DEFAULT_TEXT,
    temperature: 0.6, // higher temp for question diversity
    maxTokens: 600,
    maxRetries: 2,
  });

  logger.info('[questionGenerator] Question generated', {
    category: 'interview',
    category_val: result.data.category,
    difficulty: result.data.difficulty,
    latency: result.latency,
  });

  return result.data;
}
