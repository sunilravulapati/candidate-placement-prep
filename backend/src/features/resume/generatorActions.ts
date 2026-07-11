'use server';

import { revalidatePath } from 'next/cache';
import { getSessionUser } from '../../auth/session';
import prisma from '../../db/client';
import { parseResumeToCanonicalJson } from '../../ai/services/resumeParser';
import { generateTailoredResumeJson } from '../../ai/services/resumeGenerator';
import { PdfExtractor } from './pdfExtractor';
import { CanonicalResume } from './schema';
import { AI_MODELS } from '../../ai/core/models';

/**
 * Ensures the resume has a canonicalJson structure.
 * If not, extracts the PDF text and generates it via the AI parser.
 */
export async function parseResumeAction(resumeId: string) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  const resume = await prisma.resume.findUnique({
    where: { id: resumeId },
    include: { document: true }
  });

  if (!resume || resume.userId !== user.id) throw new Error('Resume not found');

  // Already has JSON — return immediately
  if (resume.canonicalJson) {
    return { success: true, json: resume.canonicalJson as unknown as CanonicalResume };
  }

  if (!resume.document) {
    throw new Error(
      'This resume has no PDF document and no Canonical JSON. ' +
      'Please upload a PDF first or generate a version.'
    );
  }

  try {
    const res = await fetch(resume.document.secureUrl);
    if (!res.ok) throw new Error(`Storage returned HTTP ${res.status}`);
    const buf = await res.arrayBuffer();
    const extractor = new PdfExtractor();
    const resumeText = await extractor.extractText(Buffer.from(buf));

    const canonicalJson = await parseResumeToCanonicalJson(resumeText);

    await prisma.resume.update({
      where: { id: resumeId },
      data: { canonicalJson: canonicalJson as any },
    });

    return { success: true, json: canonicalJson };
  } catch (error) {
    throw new Error('Failed to parse resume: ' + (error as Error).message);
  }
}

/**
 * Triggers the AI Rewrite Engine to generate a new tailored version.
 * Saves the result as a new Resume record (documentId = null, JSON-first).
 */
export async function generateTailoredResumeAction(
  originalResumeId: string,
  tailoringSessionId: string,
  acceptedRecommendations: any[]
) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  const originalResume = await prisma.resume.findUnique({
    where: { id: originalResumeId }
  });
  if (!originalResume || originalResume.userId !== user.id) {
    throw new Error('Original resume not found');
  }

  const session = await prisma.tailoringSession.findUnique({
    where: { id: tailoringSessionId },
    include: { jobDescription: true }
  });
  if (!session) throw new Error('Tailoring session not found');

  // Ensure original has canonicalJson
  const parseRes = await parseResumeAction(originalResumeId);
  const originalJson = parseRes.json;

  // Generate tailored JSON
  const newJson = await generateTailoredResumeJson(
    originalJson,
    session.jobDescription.originalText || '',
    acceptedRecommendations
  );

  // Determine next version number in the ResumeGroup
  const existingInGroup = await prisma.resume.findMany({
    where: { groupId: originalResume.groupId },
    orderBy: { version: 'desc' },
    take: 1,
  });
  const nextVersion = (existingInGroup[0]?.version ?? 1) + 1;

  // Save new Version as a pure JSON resume (no PDF document)
  const newResume = await prisma.resume.create({
    data: {
      userId: user.id,
      groupId: originalResume.groupId,
      documentId: null,
      version: nextVersion,
      status: 'ACTIVE',
      jdText: session.jobDescription.originalText,
      canonicalJson: newJson as any,
      generationMetadata: {
        sessionId: session.id,
        model: AI_MODELS.DEFAULT_TEXT,
        promptVersion: '1.0.0',
        timestamp: new Date().toISOString(),
        sourceResumeId: originalResumeId,
      },
    }
  });

  // Link the generated resume back to the tailoring session
  await prisma.tailoringSession.update({
    where: { id: tailoringSessionId },
    data: { generatedResumeId: newResume.id },
  });

  revalidatePath('/resume-editor');
  revalidatePath('/resume-tailoring');
  revalidatePath('/resume-ai');

  return {
    success: true,
    newResumeId: newResume.id,
    json: newJson,
    originalJson,
    version: nextVersion,
  };
}

/** Updates the canonicalJson for a resume (used by the editor autosave). */
export async function updateResumeJsonAction(resumeId: string, newJson: any) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  await prisma.resume.updateMany({
    where: { id: resumeId, userId: user.id },
    data: { canonicalJson: newJson },
  });

  return { success: true };
}

/** Returns the canonicalJson for a resume. */
export async function getResumeJsonAction(resumeId: string) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  const resume = await prisma.resume.findUnique({
    where: { id: resumeId, userId: user.id }
  });
  if (!resume) throw new Error('Resume not found');

  return {
    success: true,
    json: resume.canonicalJson,
    version: resume.version,
    metadata: resume.generationMetadata,
    isGenerated: !resume.documentId && !!resume.canonicalJson,
  };
}
