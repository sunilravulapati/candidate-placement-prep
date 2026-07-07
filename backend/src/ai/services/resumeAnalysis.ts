// backend/src/ai/services/resumeAnalysis.ts
//
// Resume Analysis AI Service.
// Integrates prompt compilation and structured AI call orchestrations.

import { callStructuredAI } from './structuredOutput';
import { RESUME_PROMPTS } from '../prompts/resume/prompts';
import { AI_MODELS } from '../models';
import { logger } from '../../core/logger';

export interface AIAnalysisResult {
  scores: {
    overall: number;
    semanticScore: number;
    atsScore: number;
    programmaticScore: number;
    breakdown: {
      Structure: number;
      Formatting: number;
      Projects: number;
      Experience: number;
      Impact: number;
      Keywords: number;
      "Action Verbs": number;
      Readability: number;
      ATS: number;
      "Technical Depth": number;
    }
  };
  strengths: string[];
  improvements: string[];
  summary: string;
  missingSkills?: string[];
}

/**
 * Validates the raw JSON output from the general resume analyzer LLM prompt.
 * @internal
 */
function validateAnalysisResult(data: any): AIAnalysisResult {
  if (!data || typeof data !== 'object') {
    throw new Error('Analysis response must be a JSON object.');
  }
  if (!data.scores || typeof data.scores !== 'object' || !data.scores.breakdown) {
    throw new Error('Analysis response is missing scores structure or breakdown.');
  }

  if (!Array.isArray(data.strengths) || !Array.isArray(data.improvements)) {
    throw new Error('Strengths and improvements must be arrays.');
  }

  if (typeof data.summary !== 'string') {
    throw new Error('Professional summary must be a string.');
  }

  return {
    scores: {
      overall: Math.round(data.scores.overall ?? 0),
      semanticScore: Math.round(data.scores.semanticScore ?? 0),
      atsScore: Math.round(data.scores.atsScore ?? 0),
      programmaticScore: Math.round(data.scores.programmaticScore ?? 0),
      breakdown: {
        Structure: Math.round(data.scores.breakdown.Structure ?? 0),
        Formatting: Math.round(data.scores.breakdown.Formatting ?? 0),
        Projects: Math.round(data.scores.breakdown.Projects ?? 0),
        Experience: Math.round(data.scores.breakdown.Experience ?? 0),
        Impact: Math.round(data.scores.breakdown.Impact ?? 0),
        Keywords: Math.round(data.scores.breakdown.Keywords ?? 0),
        "Action Verbs": Math.round(data.scores.breakdown["Action Verbs"] ?? 0),
        Readability: Math.round(data.scores.breakdown.Readability ?? 0),
        ATS: Math.round(data.scores.breakdown.ATS ?? 0),
        "Technical Depth": Math.round(data.scores.breakdown["Technical Depth"] ?? 0),
      }
    },
    strengths: data.strengths.map(String),
    improvements: data.improvements.map(String),
    summary: String(data.summary),
    missingSkills: Array.isArray(data.missingSkills) ? data.missingSkills.map(String) : [],
  };
}

/**
 * Compiles prompt parameters and coordinates the structured AI execution.
 *
 * @param resumeText - Raw text extracted from the PDF resume.
 * @returns            Validated structured analysis and run statistics.
 */
export async function runAIResumeAnalysis(
  resumeText: string
): Promise<{ analysis: AIAnalysisResult; rawOutput: string; modelUsed: string; retryCount: number; latency: number }> {
  const startTime = Date.now();
  logger.info('Preparing prompts and templates for resume analysis', { category: 'ai' });

  // Load from dynamically cached prompt manager
  const systemPrompt = RESUME_PROMPTS.ANALYZE_RESUME({ resumeText });

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    { role: 'user' as const, content: 'Analyze the provided resume document.' },
  ];

  const result = await callStructuredAI(
    messages,
    validateAnalysisResult,
    {
      model: AI_MODELS.DEFAULT_TEXT,
      temperature: 0.1,
    }
  );

  const latency = Date.now() - startTime;
  logger.info('Structured AI resume analysis completed', {
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
