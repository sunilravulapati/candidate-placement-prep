// backend/src/ai/services/tailoringRecommendation.ts
import { callStructuredAI } from './structuredOutput';
import { TAILORING_PROMPTS } from '../prompts/tailoring/prompts';
import { AI_MODELS } from '../core/models';
import { logger } from '../../core/logger';

export interface TailoringRecommendation {
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  estimatedAtsImpact: 'High' | 'Medium' | 'Low';
  whyItMatters: string;
  evidenceFromResume: string;
  evidenceFromJd: string;
  suggestedChange: string;
  affectedSection: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface AITailoringRecommendationResult {
  recommendations: TailoringRecommendation[];
}

function validateRecommendationResult(data: any): AITailoringRecommendationResult {
  if (!data || typeof data !== 'object') {
    throw new Error('Tailoring Recommendation response must be a JSON object.');
  }

  const recs = Array.isArray(data.recommendations) ? data.recommendations : [];
  
  return {
    recommendations: recs.map((r: any) => ({
      title: String(r.title || ''),
      priority: r.priority as any || 'Medium',
      estimatedAtsImpact: r.estimatedAtsImpact as any || 'Medium',
      whyItMatters: String(r.whyItMatters || ''),
      evidenceFromResume: String(r.evidenceFromResume || ''),
      evidenceFromJd: String(r.evidenceFromJd || ''),
      suggestedChange: String(r.suggestedChange || ''),
      affectedSection: String(r.affectedSection || ''),
      difficulty: r.difficulty as any || 'Medium',
    })),
  };
}

export async function runAITailoringRecommendation(
  resumeText: string,
  jdText: string,
  gaps: string
): Promise<{ analysis: AITailoringRecommendationResult; rawOutput: string; modelUsed: string; retryCount: number; latency: number }> {
  const startTime = Date.now();
  logger.info('Preparing prompts for Tailoring Recommendations', { category: 'ai' });

  const systemPrompt = TAILORING_PROMPTS.GENERATE_RECOMMENDATIONS({ resumeText, jdText, gaps });

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    { role: 'user' as const, content: 'Generate tailored recommendations based on the gaps.' },
  ];

  const result = await callStructuredAI(
    messages,
    validateRecommendationResult,
    {
      model: AI_MODELS.DEFAULT_TEXT,
      temperature: 0.2, // slightly higher temp for creative advice
    }
  );

  const latency = Date.now() - startTime;
  logger.info('Structured AI Tailoring Recommendations completed', {
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
