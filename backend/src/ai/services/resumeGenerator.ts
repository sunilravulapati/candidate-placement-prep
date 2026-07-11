import { callStructuredAI } from './structuredOutput';
import { GENERATOR_SYSTEM_PROMPT } from '../prompts/resume/generatorPrompt';
import { AI_MODELS } from '../core/models';
import { logger } from '../../core/logger';
import { canonicalResumeSchema, CanonicalResume } from '../../features/resume/schema';

export async function generateTailoredResumeJson(
  originalResume: CanonicalResume,
  jdText: string,
  recommendations: any[]
): Promise<CanonicalResume> {
  const startTime = Date.now();
  logger.info('Starting AI Resume Rewrite Engine...');

  const userPrompt = `
=== ORIGINAL RESUME ===
${JSON.stringify(originalResume, null, 2)}

=== TARGET JOB DESCRIPTION ===
${jdText}

=== ACCEPTED RECOMMENDATIONS TO APPLY ===
${JSON.stringify(recommendations, null, 2)}

Rewrite the Original Resume to apply the recommendations and target the JD, following all constraints. Output the final Canonical JSON.
`;

  try {
    const result = await callStructuredAI(
      [
        { role: 'system', content: GENERATOR_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      (data) => canonicalResumeSchema.parse(data),
      { model: AI_MODELS.DEFAULT_TEXT }
    );

    const parsedData = result.data;

    logger.info(`Resume generation completed in ${Date.now() - startTime}ms`);
    return parsedData;
  } catch (error) {
    logger.error('Error generating tailored resume JSON:', error);
    throw new Error('Failed to generate tailored resume. ' + (error as Error).message);
  }
}
