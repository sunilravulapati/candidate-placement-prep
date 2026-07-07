// backend/src/ai/services/jobDescriptionAnalysis.ts
import { callStructuredAI } from './structuredOutput';
import { JD_PROMPTS } from '../prompts/jobDescription/prompts';
import { AI_MODELS } from '../models';
import { logger } from '../../core/logger';

export interface AIJDAnalysisResult {
  role: string | null;
  company: string | null;
  responsibilities: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  experience: string | null;
  education: string | null;
  technologies: string[];
  softSkills: string[];
  keywords: string[];
}

function validateJDAnalysisResult(data: any): AIJDAnalysisResult {
  if (!data || typeof data !== 'object') {
    throw new Error('JD Analysis response must be a JSON object.');
  }

  return {
    role: data.role ? String(data.role) : null,
    company: data.company ? String(data.company) : null,
    responsibilities: Array.isArray(data.responsibilities) ? data.responsibilities.map(String) : [],
    requiredSkills: Array.isArray(data.requiredSkills) ? data.requiredSkills.map(String) : [],
    preferredSkills: Array.isArray(data.preferredSkills) ? data.preferredSkills.map(String) : [],
    experience: data.experience ? String(data.experience) : null,
    education: data.education ? String(data.education) : null,
    technologies: Array.isArray(data.technologies) ? data.technologies.map(String) : [],
    softSkills: Array.isArray(data.softSkills) ? data.softSkills.map(String) : [],
    keywords: Array.isArray(data.keywords) ? data.keywords.map(String) : [],
  };
}

export async function runAIJDAnalysis(
  jdText: string
): Promise<{ analysis: AIJDAnalysisResult; rawOutput: string; modelUsed: string; retryCount: number; latency: number }> {
  const startTime = Date.now();
  logger.info('Preparing prompts for JD analysis', { category: 'ai' });

  const systemPrompt = JD_PROMPTS.ANALYZE_JD({ jdText });

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    { role: 'user' as const, content: 'Analyze the provided job description.' },
  ];

  const result = await callStructuredAI(
    messages,
    validateJDAnalysisResult,
    {
      model: AI_MODELS.DEFAULT_TEXT,
      temperature: 0.1,
    }
  );

  const latency = Date.now() - startTime;
  logger.info('Structured AI JD analysis completed', {
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
