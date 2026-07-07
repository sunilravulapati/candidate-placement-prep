// backend/src/features/jobDescription/actions.ts
'use server';

import { createHash } from 'crypto';
import { revalidatePath } from 'next/cache';
import { getSessionUser } from '../../auth/session';
import { JobDescriptionService } from './service';
import { JobDescriptionRepository } from './repository';
import { uploadJDSchema, pasteJDSchema, idSchema } from './schema';
import { logger } from '../../core/logger';
import { PdfExtractor } from '../resume/pdfExtractor';
import { runAIJDAnalysis } from '../../ai/services/jobDescriptionAnalysis';

export async function listJobDescriptionsAction() {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('User not logged in');
  }
  const jds = await JobDescriptionService.listJobDescriptions(user.id);
  return jds.map(jd => ({
    id: jd.id,
    userId: jd.userId,
    documentId: jd.documentId,
    originalText: jd.originalText,
    status: jd.status,
    createdAt: jd.createdAt,
    updatedAt: jd.updatedAt,
    documentUrl: jd.document?.secureUrl,
  }));
}

export async function uploadJobDescriptionAction(formData: FormData) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('User session not found');
  }

  const file = formData.get('file') as File | null;
  if (!file) {
    throw new Error('No file uploaded');
  }

  const validation = uploadJDSchema.safeParse({
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

  logger.info(`Uploading JD PDF for user ${user.id}`);
  const jd = await JobDescriptionService.uploadPDF(user.id, file.name, fileBuffer, file.type, fileHash);

  revalidatePath('/job-descriptions');
  return { success: true, jdId: jd.id };
}

export async function pasteJobDescriptionAction(text: string) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('User session not found');
  }

  const validation = pasteJDSchema.safeParse({ text });
  if (!validation.success) {
    throw new Error(validation.error.errors.map(e => e.message).join(', '));
  }

  logger.info(`Pasting JD text for user ${user.id}`);
  const jd = await JobDescriptionService.pasteText(user.id, validation.data.text);

  revalidatePath('/job-descriptions');
  return { success: true, jdId: jd.id };
}

export async function archiveJobDescriptionAction(id: string) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('User session not found');
  }

  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) {
    throw new Error(parsedId.error.errors.map(e => e.message).join(', '));
  }

  logger.info(`Archiving JD ${id} for user ${user.id}`);
  await JobDescriptionService.archive(user.id, parsedId.data);

  revalidatePath('/job-descriptions');
  return { success: true };
}

export async function restoreJobDescriptionAction(id: string) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('User session not found');
  }

  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) {
    throw new Error(parsedId.error.errors.map(e => e.message).join(', '));
  }

  logger.info(`Restoring JD ${id} for user ${user.id}`);
  await JobDescriptionService.restore(user.id, parsedId.data);

  revalidatePath('/job-descriptions');
  return { success: true };
}

export async function deleteJobDescriptionAction(id: string) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('User session not found');
  }

  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) {
    throw new Error(parsedId.error.errors.map(e => e.message).join(', '));
  }

  logger.info(`Soft deleting JD ${id} for user ${user.id}`);
  await JobDescriptionService.softDelete(user.id, parsedId.data);

  revalidatePath('/job-descriptions');
  return { success: true };
}

export async function analyzeJobDescriptionAction(id: string, forceReanalyze = false) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('User session not found');
  }

  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) {
    throw new Error(parsedId.error.errors.map(e => e.message).join(', '));
  }

  const jd = await JobDescriptionRepository.findById(parsedId.data);
  if (!jd || jd.userId !== user.id) {
    throw new Error('JD not found or unauthorized');
  }

  if (!forceReanalyze && jd.analysis) {
    return {
      success: true,
      reused: true,
      analysis: jd.analysis
    };
  }

  let textToAnalyze = jd.originalText || '';

  if (!textToAnalyze && jd.document) {
    try {
      const res = await fetch(jd.document.secureUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = await res.arrayBuffer();
      const extractor = new PdfExtractor();
      textToAnalyze = await extractor.extractText(Buffer.from(buf));
    } catch (err) {
      throw new Error(`Failed to load or parse JD PDF: ${(err as Error).message}`);
    }
  }

  if (!textToAnalyze) {
    throw new Error('Job description has no text to analyze');
  }

  const result = await runAIJDAnalysis(textToAnalyze);

  const savedAnalysis = await JobDescriptionRepository.saveAnalysis(jd.id, result.analysis);

  revalidatePath('/job-descriptions');
  return {
    success: true,
    reused: false,
    analysis: savedAnalysis
  };
}
