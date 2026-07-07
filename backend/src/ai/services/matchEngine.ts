// backend/src/ai/services/matchEngine.ts
import { callStructuredAI } from './structuredOutput';
import { TAILORING_PROMPTS } from '../prompts/tailoring/prompts';
import { AI_MODELS } from '../models';
import { logger } from '../../core/logger';

export interface AIMatchResult {
  overallMatch: number;
  atsMatch: number;
  keywordMatch: number;
  technicalSkillsMatch: number;
  projectsMatch: number;
  experienceMatch: number;
  educationMatch: number;
  responsibilitiesMatch: number;
  softSkillsMatch: number;
  missingSkills: string[];
  matchingSkills: string[];
}

function validateMatchResult(data: any): AIMatchResult {
  if (!data || typeof data !== 'object') {
    throw new Error('Match Engine response must be a JSON object.');
  }

  return {
    overallMatch: Math.round(Number(data.overallMatch) || 0),
    atsMatch: Math.round(Number(data.atsMatch) || 0),
    keywordMatch: Math.round(Number(data.keywordMatch) || 0),
    technicalSkillsMatch: Math.round(Number(data.technicalSkillsMatch) || 0),
    projectsMatch: Math.round(Number(data.projectsMatch) || 0),
    experienceMatch: Math.round(Number(data.experienceMatch) || 0),
    educationMatch: Math.round(Number(data.educationMatch) || 0),
    responsibilitiesMatch: Math.round(Number(data.responsibilitiesMatch) || 0),
    softSkillsMatch: Math.round(Number(data.softSkillsMatch) || 0),
    missingSkills: Array.isArray(data.missingSkills) ? data.missingSkills.map(String) : [],
    matchingSkills: Array.isArray(data.matchingSkills) ? data.matchingSkills.map(String) : [],
  };
}

export async function runAIMatchEngine(
  resumeText: string,
  jdText: string
): Promise<{ analysis: AIMatchResult; rawOutput: string; modelUsed: string; retryCount: number; latency: number }> {
  const startTime = Date.now();
  logger.info('Preparing prompts for Resume-JD Matching', { category: 'ai' });

  const systemPrompt = TAILORING_PROMPTS.COMPARE_RESUME_JD({ resumeText, jdText });

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    { role: 'user' as const, content: 'Compare the resume and job description.' },
  ];

  const result = await callStructuredAI(
    messages,
    validateMatchResult,
    {
      model: AI_MODELS.DEFAULT_TEXT,
      temperature: 0.1,
    }
  );

  const latency = Date.now() - startTime;
  logger.info('Structured AI Match Engine completed', {
    category: 'completion',
    processingTime: latency,
  });

  return {
    analysis: result.data,
    rawOutput: result.rawOutput,
    modelUsed: result.modelUsed,
    retryCount: result.retryCount,
    latency,
  };
}
