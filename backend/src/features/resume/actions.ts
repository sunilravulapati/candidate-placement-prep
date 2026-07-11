// backend/src/features/resume/actions.ts
'use server';

import { createHash } from 'crypto';
import { revalidatePath } from 'next/cache';
import { getSessionUser } from '../../auth/session';
import { ResumeService } from './service';
import { ResumeRepository } from './repository';
import { TailoringRepository } from './tailoringRepository';
import { JobDescriptionRepository } from '../jobDescription/repository';
import { orchestrateResumeAnalysis, orchestrateResumeAnalysisFromText } from './analyzeResume';
import { renameResumeSchema, deleteResumeSchema, uploadFileSchema } from './schema';
import { logger } from '../../core/logger';
import { storageProvider } from '../../utils/storage';
import type { UploadCheckResult } from './types';
import { runAIMatchEngine } from '../../ai/services/matchEngine';
import { runAITailoringRecommendation } from '../../ai/services/tailoringRecommendation';
import { PdfExtractor } from './pdfExtractor';
import { resumeJsonToText } from './resumeSerializer';

export async function listResumesAction() {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('User not logged in');
  }
  const resumes = await ResumeService.listResumes(user.id);
  return resumes.map(r => ({
    id: r.id,
    groupId: r.groupId,
    userId: r.userId,
    name: r.group.name,
    url: r.document?.secureUrl,
    version: r.version,
    atsScore: r.atsScore,
    feedback: r.feedback,
    jdText: r.jdText,
    createdAt: r.createdAt,
    latestAnalysis: r.analyses?.[0] || null,
    // Source metadata — critical for JSON-first pipeline
    isGenerated: !r.documentId && !!r.canonicalJson,
    hasPdf: !!r.document?.secureUrl,
    hasCanonicalJson: !!r.canonicalJson,
    generationMetadata: r.generationMetadata,
  }));
}

export async function uploadResumeAction(formData: FormData) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('User session not found');
  }

  const file = formData.get('file') as File | null;
  if (!file) {
    throw new Error('No file uploaded');
  }

  const validation = uploadFileSchema.safeParse({
    name: file.name,
    type: file.type,
    size: file.size,
  });

  if (!validation.success) {
    const errorMsg = validation.error.errors.map(e => e.message).join(', ');
    throw new Error(errorMsg);
  }

  const arrayBuffer = await file.arrayBuffer();
  const fileBuffer = Buffer.from(arrayBuffer);
  const fileHash = createHash('sha256').update(fileBuffer).digest('hex');

  const result = await ResumeService.uploadResume(
    user.id,
    file.name,
    fileBuffer,
    file.type,
    fileHash
  );

  revalidatePath('/resume-ai');

  return {
    success: true,
    data: {
      id: result.id,
      name: result.group.name,
      url: result.document?.secureUrl,
      createdAt: result.createdAt,
    },
  };
}

export async function renameResumeGroupAction(groupId: string, name: string) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('User session not found');
  }

  // We reuse the rename schema, assuming id is now groupId
  const parsed = renameResumeSchema.safeParse({ id: groupId, name });
  if (!parsed.success) {
    throw new Error(parsed.error.errors.map(e => e.message).join(', '));
  }

  const result = await ResumeService.renameResumeGroup(user.id, parsed.data.id, parsed.data.name);

  revalidatePath('/resume-ai');

  return {
    success: true,
    data: result,
  };
}

export async function deleteResumeAction(id: string) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('User session not found');
  }

  const parsedId = deleteResumeSchema.safeParse(id);
  if (!parsedId.success) {
    throw new Error(parsedId.error.errors.map(e => e.message).join(', '));
  }

  await ResumeService.softDeleteResume(user.id, parsedId.data);

  revalidatePath('/resume-ai');

  return {
    success: true,
  };
}

export async function getResumeAnalysisHistoryAction(resumeId: string) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('User session not found');
  }

  const resume = await ResumeRepository.findById(resumeId);
  if (!resume || resume.userId !== user.id) {
    throw new Error('Resume not found or unauthorized');
  }

  return ResumeRepository.findAnalysisHistory(resumeId);
}

/**
 * Handles the upload phase and performs a backend-only file hash duplicate check.
 */
export async function uploadAndCheckCacheAction(formData: FormData): Promise<UploadCheckResult> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('User session not found. Please log in.');
  }

  const file = formData.get('file') as File | null;
  if (!file) {
    throw new Error('No file uploaded.');
  }

  const validation = uploadFileSchema.safeParse({
    name: file.name,
    type: file.type,
    size: file.size,
  });

  if (!validation.success) {
    throw new Error(validation.error.errors.map(e => e.message).join(', '));
  }

  const arrayBuffer = await file.arrayBuffer();
  const fileBuffer = Buffer.from(arrayBuffer);

  const fileHash = createHash('sha256').update(fileBuffer).digest('hex');
  logger.info(`Checking duplicate file hash cache: ${fileHash}`, {
    category: 'upload',
    userId: user.id,
  });

  const existingResume = await ResumeRepository.findByHash(user.id, fileHash);
  if (existingResume) {
    logger.info(`Cache Hit found for resume hash: ${fileHash}`, {
      category: 'upload',
      userId: user.id,
      resumeId: existingResume.id,
    });
    return {
      success: true,
      cacheHit: true,
      resumeId: existingResume.id,
      fileName: existingResume.group.name,
      url: existingResume.document?.secureUrl,
      latestAnalysis: existingResume.analyses[0] || null,
    };
  }

  logger.info('Cache Miss. Uploading file to storage provider...', { category: 'upload', userId: user.id });
  const newResume = await ResumeService.uploadResume(user.id, file.name, fileBuffer, file.type, fileHash);

  revalidatePath('/resume-ai');

  return {
    success: true,
    cacheHit: false,
    resumeId: newResume.id,
    fileName: newResume.group.name,
    url: newResume.document?.secureUrl,
  };
}

/**
 * Coordinates the analysis orchestration for an uploaded Resume.
 */
export async function analyzeResumeAction(
  resumeId: string,
  forceReanalyze = false
) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('User session not found. Please log in.');
  }

  logger.info(`Server Action analyzeResumeAction started. resumeId: ${resumeId}, forceReanalyze: ${forceReanalyze}`, {
    category: 'upload',
    userId: user.id,
    resumeId,
  });

  const resume = await ResumeRepository.findByIdWithLatestAnalysis(resumeId);
  if (!resume) {
    throw new Error('Resume record not found.');
  }

  if (resume.userId !== user.id) {
    throw new Error('Unauthorized to access this resume.');
  }

  if (!forceReanalyze && resume.analyses && resume.analyses.length > 0) {
    const latest = resume.analyses[0];
    logger.info(`Reusing previous cached analysis: ${latest.id}`, {
      category: 'database',
      resumeId,
    });
    return {
      success: true,
      reused: true,
      analysisId: latest.id,
      overallScore: latest.overallScore,
      atsScore: latest.atsScore,
      semanticScore: latest.semanticScore,
      warnings: latest.warnings,
      preservationScore: latest.preservationScore,
      modelUsed: latest.modelUsed,
      processingTime: latest.processingTime,
      promptVersion: latest.promptVersion,
      createdAt: latest.createdAt,
      analysis: latest.analysis,
    };
  }

  // JSON-first pipeline: prefer canonicalJson over PDF re-download
  // This is the fix for generated resumes that have no PDF document.
  let result;
  if (resume.canonicalJson) {
    logger.info(`Resume ${resumeId} has canonicalJson — building text from JSON (no PDF needed)`, {
      category: 'upload',
      userId: user.id,
      resumeId,
    });
    const resumeText = resumeJsonToText(resume.canonicalJson as any);
    if (!resumeText.trim()) {
      throw new Error('Generated resume JSON produced empty text. The resume may be malformed.');
    }
    result = await orchestrateResumeAnalysisFromText(user.id, resumeId, resumeText, resume.group.name);
  } else if (resume.document) {
    // Original uploaded PDF path
    logger.info(`Resume ${resumeId} has PDF document — fetching from storage`, {
      category: 'upload',
      userId: user.id,
      resumeId,
    });
    let fileBuffer: Buffer;
    try {
      const res = await fetch(resume.document.secureUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status} from storage`);
      const buf = await res.arrayBuffer();
      fileBuffer = Buffer.from(buf);
    } catch (err) {
      throw new Error(`Failed to load resume PDF from storage: ${(err as Error).message}`);
    }
    result = await orchestrateResumeAnalysis(user.id, resumeId, fileBuffer, resume.group.name);
  } else {
    throw new Error(
      'This resume has neither a PDF document nor a Canonical JSON. ' +
      'Please upload a new PDF or generate a version first.'
    );
  }

  revalidatePath('/resume-ai');

  return {
    success: true,
    reused: false,
    ...result,
  };
}

export async function createTailoringSessionAction(
  resumeId: string,
  jdId: string,
  forceRecreate = false
) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('User session not found');
  }

  const resume = await ResumeRepository.findById(resumeId);
  const jd = await JobDescriptionRepository.findById(jdId);

  if (!resume || resume.userId !== user.id) throw new Error('Resume not found');
  if (!jd || jd.userId !== user.id) throw new Error('JD not found');

  if (!forceRecreate) {
    const existing = await TailoringRepository.findByResumeAndJd(resumeId, jdId);
    if (existing) {
      logger.info(`Reusing cached tailoring session: ${existing.id}`, {
        category: 'database',
        resumeId,
        jdId,
      });
      revalidatePath('/resume-tailoring');
      return {
        success: true,
        reused: true,
        sessionId: existing.id,
        session: existing,
      };
    }
  }

  // JSON-first: prefer canonicalJson → human-readable text over PDF re-extraction
  let resumeText = '';
  try {
    if (resume.canonicalJson) {
      // Use the shared serializer — produces identical quality to PDF-extracted text
      resumeText = resumeJsonToText(resume.canonicalJson as any);
    } else if (resume.document) {
      const res = await fetch(resume.document.secureUrl);
      if (!res.ok) throw new Error('Failed to fetch resume PDF from storage');
      const buf = await res.arrayBuffer();
      const extractor = new PdfExtractor();
      resumeText = await extractor.extractText(Buffer.from(buf));
    } else {
      throw new Error('Resume has no PDF document and no Canonical JSON');
    }
  } catch (err) {
    throw new Error(`Failed to extract resume text: ${(err as Error).message}`);
  }

  let jdText = jd.originalText || '';
  if (!jdText && jd.document) {
    try {
      const res = await fetch(jd.document.secureUrl);
      if (!res.ok) throw new Error('Failed to fetch jd pdf');
      const buf = await res.arrayBuffer();
      const extractor = new PdfExtractor();
      jdText = await extractor.extractText(Buffer.from(buf));
    } catch (err) {
      throw new Error(`Failed to extract text from JD: ${(err as Error).message}`);
    }
  }

  if (!resumeText || !jdText) throw new Error('Missing text content for comparison');

  const matchResult = await runAIMatchEngine(resumeText, jdText);
  const matchData = matchResult.analysis;

  const gapsString = matchData.missingSkills.join(', ') || 'None found';
  const recResult = await runAITailoringRecommendation(resumeText, jdText, gapsString);
  const recData = recResult.analysis;

  const session = await TailoringRepository.createSession({
    resumeId,
    jobDescriptionId: jdId,
    matchScore: matchData.overallMatch,
    atsScore: matchData.atsMatch,
    keywordCoverage: matchData.keywordMatch,
    matchDetails: matchData,
    missingSkills: matchData.missingSkills,
    matchingSkills: matchData.matchingSkills,
    recommendations: recData.recommendations,
  });

  const fullSession = await TailoringRepository.findById(session.id);

  revalidatePath('/resume-tailoring');
  return {
    success: true,
    reused: false,
    sessionId: session.id,
    session: fullSession,
    data: {
      match: matchData,
      recommendations: recData.recommendations,
    },
  };
}

export async function getTailoringHistoryAction(resumeId: string) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('User session not found');
  }

  const resume = await ResumeRepository.findById(resumeId);
  if (!resume || resume.userId !== user.id) {
    throw new Error('Resume not found or unauthorized');
  }

  return TailoringRepository.findByResumeId(resumeId);
}

export async function getTailoringSessionByIdAction(sessionId: string) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('User session not found');
  }
  const session = await TailoringRepository.findById(sessionId);
  if (!session || session.resume.userId !== user.id) {
    throw new Error('Session not found or unauthorized');
  }
  return session;
}
