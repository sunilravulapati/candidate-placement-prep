// backend/src/ai/services/interview/interviewPlanner.ts
//
// Interview Planner Service.
// Generates an InterviewPlan before the first question is asked.
// The plan drives question generation, topic coverage, and evaluation.

import { callStructuredAI } from '../structuredOutput';
import { buildPlannerPrompt } from '../../prompts/interview/prompts';
import { AI_MODELS } from '../../core/models';
import { logger } from '../../../core/logger';
import type {
  InterviewConfig,
  InterviewPersonaData,
  InterviewPlan,
  EvaluationRubric,
  InterviewStage,
} from '../../../features/mockInterview/types';

function validateInterviewPlan(data: any): InterviewPlan {
  if (!data || typeof data !== 'object') {
    throw new Error('Planner response must be a JSON object');
  }
  if (!data.title || !data.stages || !Array.isArray(data.stages)) {
    throw new Error('Planner response missing required fields: title, stages');
  }
  if (!Array.isArray(data.evaluationRubric)) {
    throw new Error('Planner response missing evaluationRubric');
  }

  const stages: InterviewStage[] = data.stages.map((s: any) => ({
    name: String(s.name || 'Stage'),
    description: String(s.description || ''),
    questionCount: Number(s.questionCount || 2),
    topics: Array.isArray(s.topics) ? s.topics.map(String) : [],
    estimatedMinutes: Number(s.estimatedMinutes || 10),
  }));

  const evaluationRubric: EvaluationRubric[] = data.evaluationRubric.map(
    (r: any) => ({
      dimension: String(r.dimension),
      weight: Number(r.weight),
      description: String(r.description || ''),
    })
  );

  return {
    title: String(data.title),
    persona: String(data.persona || 'Standard Interviewer'),
    stages,
    totalQuestions: Number(data.totalQuestions || stages.reduce((a, s) => a + s.questionCount, 0)),
    estimatedDurationMinutes: Number(data.estimatedDurationMinutes || 30),
    topics: Array.isArray(data.topics) ? data.topics.map(String) : [],
    difficulty: data.difficulty || 'MEDIUM',
    companyStyle: data.companyStyle || null,
    targetSkills: Array.isArray(data.targetSkills) ? data.targetSkills.map(String) : [],
    evaluationRubric,
    difficultyProgression: data.difficultyProgression || 'ascending',
  };
}

/**
 * Generates a complete interview plan from configuration.
 * Called once before the first question is asked.
 */
export async function generateInterviewPlan(
  config: InterviewConfig,
  persona?: InterviewPersonaData
): Promise<InterviewPlan> {
  logger.info('[interviewPlanner] Generating interview plan', {
    category: 'interview',
    type: config.type,
    difficulty: config.difficulty,
    role: config.targetRole,
    company: config.targetCompany,
  });

  const messages = buildPlannerPrompt(config, persona);

  const result = await callStructuredAI(messages, validateInterviewPlan, {
    model: AI_MODELS.DEFAULT_TEXT,
    temperature: 0.4,
    maxTokens: 2000,
    maxRetries: 2,
  });

  logger.info('[interviewPlanner] Plan generated successfully', {
    category: 'interview',
    title: result.data.title,
    stages: result.data.stages.length,
    totalQuestions: result.data.totalQuestions,
    latency: result.latency,
  });

  return result.data;
}
