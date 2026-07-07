// backend/src/ai/services/resumeVerification.ts
//
// Resume Verification AI Service.
// Calls LLM verify-resume prompt to perform document classification.

import { callStructuredAI } from './structuredOutput';
import { RESUME_PROMPTS } from '../prompts/resume/prompts';
import { AI_MODELS } from '../models';
import { logger } from '../../core/logger';

export interface AIVerificationResult {
  isResume: boolean;
  confidence: number;
  reason: string;
}

/**
 * Validates the raw JSON output from the resume classification LLM prompt.
 * @internal
 */
function validateVerificationResult(data: any): AIVerificationResult {
  if (!data || typeof data !== 'object') {
    throw new Error('Verification response must be a JSON object.');
  }
  return {
    isResume: Boolean(data.isResume),
    confidence: typeof data.confidence === 'number' ? Math.round(data.confidence) : 50,
    reason: typeof data.reason === 'string' ? data.reason : 'AI verification completed',
  };
}

/**
 * Runs the AI fallback classifier on the document text.
 * Uses the fast, low-latency FAST_TEXT model (Llama-3.1-8b).
 *
 * @param documentText - The text snippet to analyze (up to 3000 chars).
 * @returns              Classification details.
 */
export async function runAIResumeVerification(
  documentText: string
): Promise<AIVerificationResult> {
  const startTime = Date.now();
  logger.info('Preparing verification prompts for document classification', { category: 'ai' });

  // Get substituted prompt using cached loader
  const systemPrompt = RESUME_PROMPTS.VERIFY_RESUME({
    documentText: documentText.slice(0, 3000),
  });

  const result = await callStructuredAI(
    [{ role: 'system' as const, content: systemPrompt }],
    validateVerificationResult,
    {
      model: AI_MODELS.FAST_TEXT,
      temperature: 0,
    }
  );

  const latency = Date.now() - startTime;
  logger.info(`AI document verification finished in ${latency}ms. isResume: ${result.data.isResume}`, {
    category: 'completion',
    processingTime: latency,
  });

  return result.data;
}
