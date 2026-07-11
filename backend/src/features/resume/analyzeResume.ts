// backend/src/features/resume/analyzeResume.ts
//
// Resume Analysis Orchestration Layer.
//
// COORDINATION CONTRACT:
//   This module orchestrates the workflow ONLY.
//   It must NOT contain parsing, scoring, or prompt construction logic directly.
//   It imports from existing decoupled modules to complete the pipeline.
//
// Two entry points:
//   orchestrateResumeAnalysis(userId, resumeId, fileBuffer, fileName)
//     — PDF path: extracts text from binary buffer, then analyzes.
//
//   orchestrateResumeAnalysisFromText(userId, resumeId, resumeText, fileName)
//     — JSON-first path: accepts pre-built text, skips PDF extraction.
//     — Used for generated resumes that have canonicalJson but no PDF.

import { logger } from '../../core/logger';
import { PdfExtractor } from './pdfExtractor';
import { validateUpload } from './uploadValidator';
import { parseResume } from './parser';
import { runAIResumeAnalysis } from '../../ai/services/resumeAnalysis';
import { normalizeResume } from './normalizer';
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

// ---------------------------------------------------------------------------
// Internal shared pipeline (text → AI → database)
// ---------------------------------------------------------------------------

async function runAnalysisPipeline(
  userId: string,
  resumeId: string,
  text: string,
  startTime: number,
  skipValidation: boolean
): Promise<AnalysisOrchestrationResult> {
  let totalWarnings: string[] = [];

  // 1. Validate Upload Authenticity (optional — skip for generated resumes)
  if (!skipValidation) {
    const validationStart = Date.now();
    let validationResult;
    try {
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

    if (validationResult.reason && validationResult.confidence !== 'high') {
      totalWarnings.push(`Validation warning: ${validationResult.reason}`);
    }
  }

  // 2. Structural Parse Metadata
  logger.info('Parsing lightweight structural metadata from plain text', { category: 'parsing', resumeId });
  const parsedMeta = parseResume(text);

  // 3. AI Recruiter Analysis
  const aiStart = Date.now();
  let aiResult;
  try {
    aiResult = await runAIResumeAnalysis(text);
  } catch (err) {
    const elapsed = Date.now() - startTime;
    await logFailedRun(resumeId, 'ANALYZING', elapsed, err, 'unknown');
    throw err;
  }

  const { analysis: aiResponse, modelUsed, retryCount } = aiResult;

  // 4. Normalization
  logger.info('Normalizing parsed metadata and AI responses', { category: 'parsing', resumeId });
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

  // 5. Scores from AI response
  const overallScore = aiResponse.scores.overall;
  const atsScore = aiResponse.scores.atsScore;
  const semanticScore = aiResponse.scores.semanticScore;

  // 6. Trimming & Quality Audit
  logger.info('Running post-processing deduplication and limit trimmers', { category: 'parsing', resumeId });
  const trimmed: TrimmedResume = sectionAwareTrimming(normalized, null, 'general');
  const qualityAudit = evaluateResumeQuality(trimmed);
  totalWarnings = [...totalWarnings, ...qualityAudit.warnings];

  const processingTime = Date.now() - startTime;

  // 7. Database Storage
  logger.info('Saving finalized ResumeAnalysis to database', { category: 'database', resumeId });
  const dbAnalysis = await ResumeRepository.createAnalysis({
    resumeId,
    overallScore,
    atsScore,
    semanticScore,
    analysis: aiResponse as any,
    processingTime,
    promptVersion: '1.0.0',
    modelUsed,
    warnings: totalWarnings,
    preservationScore: trimmed.preservationScore,
  });

  // 8. Analytics Run
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
    atsScore,
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

// ---------------------------------------------------------------------------
// PDF entry point (original uploaded resume path)
// ---------------------------------------------------------------------------

/**
 * End-to-end orchestration for analyzing a PDF resume.
 *
 * @param userId     - Clerk user ID.
 * @param resumeId   - Database Resume record UUID.
 * @param fileBuffer - Raw binary PDF buffer.
 * @param fileName   - Original file name (for logging).
 */
export async function orchestrateResumeAnalysis(
  userId: string,
  resumeId: string,
  fileBuffer: Buffer,
  fileName: string
): Promise<AnalysisOrchestrationResult> {
  const startTime = Date.now();
  logger.info(`Starting PDF analysis pipeline for resume: ${resumeId}`, {
    category: 'upload',
    userId,
    resumeId,
  });

  const extractor = new PdfExtractor();
  let text = '';
  try {
    text = await extractor.extractText(fileBuffer);
    logger.info(`Extracted PDF text. Length: ${text.length} chars`, { category: 'parsing', resumeId });
  } catch (err) {
    const elapsed = Date.now() - startTime;
    await logFailedRun(resumeId, 'EXTRACTING', elapsed, err, 'unknown');
    throw err;
  }

  // Full validation for PDF uploads (authenticity check)
  return runAnalysisPipeline(userId, resumeId, text, startTime, false);
}

// ---------------------------------------------------------------------------
// Text entry point (JSON-first path for generated resumes)
// ---------------------------------------------------------------------------

/**
 * Orchestrates resume analysis when text is already available (e.g. from canonicalJson).
 * Skips PDF extraction. Skips document authenticity validation (already a known resume).
 *
 * This is the fix for generated resumes that have canonicalJson but no PDF.
 *
 * @param userId     - Clerk user ID.
 * @param resumeId   - Database Resume record UUID.
 * @param resumeText - Pre-built plain-text representation of the resume.
 * @param fileName   - Resume name / label (for logging).
 */
export async function orchestrateResumeAnalysisFromText(
  userId: string,
  resumeId: string,
  resumeText: string,
  fileName: string
): Promise<AnalysisOrchestrationResult> {
  const startTime = Date.now();
  logger.info(`Starting text-based analysis for resume: ${resumeId} (JSON source — no PDF required)`, {
    category: 'upload',
    userId,
    resumeId,
  });

  // skipValidation=true because this is a canonical JSON from our own system
  return runAnalysisPipeline(userId, resumeId, resumeText, startTime, true);
}

// ---------------------------------------------------------------------------
// Internal helper
// ---------------------------------------------------------------------------

/** Logs a failed pipeline analytics run. @internal */
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
