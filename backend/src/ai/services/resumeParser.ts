import { callStructuredAI } from './structuredOutput';
import { PARSE_RESUME_SYSTEM_PROMPT } from '../prompts/resume/parsePrompt';
import { AI_MODELS } from '../models';
import { logger } from '../../core/logger';
import { canonicalResumeSchema, CanonicalResume } from '../../features/resume/schema';

export async function parseResumeToCanonicalJson(resumeText: string): Promise<CanonicalResume> {
  const startTime = Date.now();
  logger.info('Starting Resume JSON parsing...');

  try {
    const result = await callStructuredAI(
      [
        { role: 'system', content: PARSE_RESUME_SYSTEM_PROMPT },
        { role: 'user', content: `Parse the following resume text into structured JSON:\n\n${resumeText}` }
      ],
      (data) => canonicalResumeSchema.parse(data),
      { model: AI_MODELS.DEFAULT_TEXT }
    );

    const parsedData = result.data;

    logger.info(`Resume parsing completed in ${Date.now() - startTime}ms`);
    return parsedData;
  } catch (error) {
    logger.error('Error parsing resume to JSON:', error);
    throw new Error('Failed to parse resume into structured data. ' + (error as Error).message);
  }
}
