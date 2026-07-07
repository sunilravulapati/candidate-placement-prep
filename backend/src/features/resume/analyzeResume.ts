// backend/src/features/resume/analyzeResume.ts
//
// Resume Analysis Orchestration Layer.
//
// COORDINATION CONTRACT (Rule 3):
//   This module orchestrates the workflow ONLY.
//   It must NOT contain parsing, scoring, or prompt construction logic directly.
//   It imports from existing decoupled modules to complete the pipeline.
//
// Workflow Flow:
//   Upload/Hash -> pdfExtractor -> validateUpload -> parseResume -> runAIResumeAnalysis ->
//   normalizeResume -> scoring -> trimmer -> resumeValidator -> Repository write -> Run Analytics write.

import { createHash } from 'crypto';
import { logger } from '../../core/logger';
import { PdfExtractor } from './pdfExtractor';
import { validateUpload } from './uploadValidator';
import { parseResume } from './parser';
import { runAIResumeAnalysis } from '../../ai/services/resumeAnalysis';
import { normalizeResume } from './normalizer';
import { calculateProgrammaticScore, calculateFinalScore } from './scoring';
import { evaluateResumeQuality } from './resumeValidator';
import { sectionAwareTrimming } from './trimmer';
import { ResumeRepository } from './repository';
import type { NormalizedResume } from './normalizer';
import type { TrimmedResume } from './trimmer';

export interface AnalysisOrchestrationResult {
  analysisId: string;
  overallScore: number;
  atsScore: number;
  semanticScore: number;
  warnings: string[];
  preservationScore: number;
  modelUsed: string;
  processingTime: number;
  promptVersion: string;
  createdAt: Date;
  analysis: unknown;
}

/**
 * End-to-end orchestration pipeline for analyzing resume content.
 *
 * @param userId     - Clerk user ID.
 * @param resumeId   - Database Resume record UUID.
 * @param fileBuffer - Raw binary document buffer.
 * @param fileName   - Original file name.
 */
export async function orchestrateResumeAnalysis(
  userId: string,
  resumeId: string,
  fileBuffer: Buffer,
  fileName: string
): Promise<AnalysisOrchestrationResult> {
  const startTime = Date.now();
  logger.info(`Starting orchestration pipeline for resume: ${resumeId}`, {
    category: 'upload',
    userId,
    resumeId,
  });

  // Hash is computed during upload in actions.ts. No need to compute it here.

  // 1. Text Extraction
  const extractor = new PdfExtractor();
  let text = '';
  try {
    text = await extractor.extractText(fileBuffer);
    logger.info(`Extracted PDF text content. Length: ${text.length} chars`, {
      category: 'parsing',
      resumeId,
    });
  } catch (err) {
    const elapsed = Date.now() - startTime;
    await logFailedRun(resumeId, 'EXTRACTING', elapsed, err, 'unknown');
    throw err;
  }

  // 2. Validate Upload (Authenticity check)
  const validationStart = Date.now();
  let validationResult;
  try {
    // Inject the AI classification fallback using dynamically imported AI verification service
    validationResult = await validateUpload(text, async (documentText: string) => {
      const { runAIResumeVerification } = await import('../../ai/services/resumeVerification');
      return runAIResumeVerification(documentText);
    });
  } catch (err) {
    const elapsed = Date.now() - startTime;
    await logFailedRun(resumeId, 'VALIDATING', elapsed, err, 'unknown');
    throw err;
  }

  const validationTime = Date.now() - validationStart;
  logger.info(`Authenticity validation finished. isResume: ${validationResult.isResume}`, {
    category: 'parsing',
    processingTime: validationTime,
    resumeId,
  });

  if (!validationResult.isResume) {
    const error = new Error(`File rejected: ${validationResult.reason}`);
    const elapsed = Date.now() - startTime;
    await logFailedRun(resumeId, 'VALIDATING', elapsed, error, 'unknown');
    throw error;
  }

  // 3. Structural Parse Metadata
  logger.info('Parsing lightweight structural metadata from plain text', { category: 'parsing', resumeId });
  const parsedMeta = parseResume(text);

  // 4. AI Recruiter Analysis
  const aiStart = Date.now();
  let aiResult;
  try {
    aiResult = await runAIResumeAnalysis(text);
  } catch (err) {
    const aiLatency = Date.now() - aiStart;
    const elapsed = Date.now() - startTime;
    await logFailedRun(resumeId, 'ANALYZING', elapsed, err, 'unknown');
    throw err;
  }
  const aiLatency = Date.now() - aiStart;

  const { analysis: aiResponse, modelUsed, retryCount } = aiResult;

  // 5. Normalization
  logger.info('Normalizing parsed metadata and AI responses', { category: 'parsing', resumeId });
  // Map parsed metadata into a unified object structure
  const normalized: NormalizedResume = normalizeResume({
    basics: {
      name: parsedMeta.contacts.email ? parsedMeta.contacts.email.split('@')[0] : 'Candidate',
      email: parsedMeta.contacts.email || '',
      phone: parsedMeta.contacts.phone || '',
      linkedin: parsedMeta.contacts.linkedin || '',
      github: parsedMeta.contacts.github || '',
      portfolio: parsedMeta.contacts.portfolio || '',
      location: '',
      tagline: '',
    },
    summary: aiResponse.summary,
    skills: parsedMeta.skills.map(s => ({ label: 'Skills', value: s })),
    metrics: parsedMeta.metrics,
    experience: [],
    projects: parsedMeta.bullets.slice(0, 4).map((b, i) => ({
      title: `Project ${i + 1}`,
      bullets: [b],
      tech: '',
      meta: '',
    })),
  });

  // 6. Scoring (Programmatic + Semantic + ATS) from AI
  logger.info('Running scoring engines', { category: 'parsing', resumeId });
  const programmaticScore = aiResponse.scores.programmaticScore;
  const semanticScore = aiResponse.scores.semanticScore;
  const atsScore = aiResponse.scores.atsScore;
  const overallScore = aiResponse.scores.overall;

  // 7. Deduplication, Limits, Warnings, Trimming
  logger.info('Running post-processing deduplication and limit trimmers', { category: 'parsing', resumeId });
  const trimmed: TrimmedResume = sectionAwareTrimming(normalized, null, 'general');
  const qualityAudit = evaluateResumeQuality(trimmed);

  // Accumulate warnings
  const totalWarnings = [...qualityAudit.warnings];
  if (validationResult.reason && validationResult.confidence !== 'high') {
    totalWarnings.push(`Validation warning: ${validationResult.reason}`);
  }

  const processingTime = Date.now() - startTime;

  // 8. Database Storage (Write history - Rule 8)
  logger.info('Saving finalized ResumeAnalysis to database', { category: 'database', resumeId });
  const dbAnalysis = await ResumeRepository.createAnalysis({
    resumeId,
    overallScore,
    atsScore,
    semanticScore,
    analysis: aiResponse as any,
    processingTime,
    promptVersion: '1.0.0', // Standard prompt version code
    modelUsed,
    warnings: totalWarnings,
    preservationScore: trimmed.preservationScore,
  });

  // Log successful AnalysisRun analytics (Rule 9)
  await ResumeRepository.createRun({
    analysisId: dbAnalysis.id,
    resumeId,
    status: 'SUCCESS',
    latency: processingTime,
    retryCount,
    modelUsed,
    error: null,
    tokensUsed: null,
  });

  logger.info(`Analysis pipeline completed successfully in ${processingTime}ms`, {
    category: 'completion',
    processingTime,
    resumeId,
  });

  return {
    analysisId: dbAnalysis.id,
    overallScore,
    atsScore: programmaticScore,
    semanticScore,
    warnings: totalWarnings,
    preservationScore: trimmed.preservationScore,
    modelUsed,
    processingTime,
    promptVersion: dbAnalysis.promptVersion,
    createdAt: dbAnalysis.createdAt,
    analysis: aiResponse,
  };
}

/** Helper function to log failed analytics runs. @internal */
async function logFailedRun(
  resumeId: string,
  stage: string,
  latency: number,
  err: any,
  modelUsed: string
): Promise<void> {
  const errorMsg = err instanceof Error ? err.message : String(err);
  logger.error(`Orchestrator pipeline failed at stage: ${stage}`, err, { category: 'error', resumeId });
  try {
    await ResumeRepository.createRun({
      resumeId,
      status: 'FAILED',
      latency,
      retryCount: 0,
      modelUsed,
      error: `[${stage}] ${errorMsg}`,
      tokensUsed: null,
    });
  } catch (dbErr) {
    logger.error('Failed to log failure run to database', dbErr, { category: 'database', resumeId });
  }
}
