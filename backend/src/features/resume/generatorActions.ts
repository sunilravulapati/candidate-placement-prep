'use server';

import { revalidatePath } from 'next/cache';
import { getSessionUser } from '../../auth/session';
import prisma from '../../db/client';
import { parseResumeToCanonicalJson } from '../../ai/services/resumeParser';
import { generateTailoredResumeJson } from '../../ai/services/resumeGenerator';
import { PdfExtractor } from './pdfExtractor';
import { CanonicalResume } from './schema';

/**
 * Ensures the resume has a canonicalJson structure.
 * If not, extracts the PDF text and generates it via the parser.
 */
export async function parseResumeAction(resumeId: string) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  const resume = await prisma.resume.findUnique({
    where: { id: resumeId },
    include: { document: true }
  });

  if (!resume || resume.userId !== user.id) throw new Error('Resume not found');
  if (resume.canonicalJson) {
    return { success: true, json: resume.canonicalJson as unknown as CanonicalResume };
  }

  if (!resume.document) throw new Error('Resume has no PDF and no Canonical JSON');

  try {
    const res = await fetch(resume.document.secureUrl);
    if (!res.ok) throw new Error('Failed to fetch pdf');
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
 * Triggers the AI Rewrite Engine to generate a new Version.
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
  if (!originalResume || originalResume.userId !== user.id) throw new Error('Original resume not found');

  const session = await prisma.tailoringSession.findUnique({
    where: { id: tailoringSessionId },
    include: { jobDescription: true }
  });
  if (!session) throw new Error('Tailoring session not found');

  // Ensure Original has JSON
  const parseRes = await parseResumeAction(originalResumeId);
  const originalJson = parseRes.json;

  // Generate new JSON
  const newJson = await generateTailoredResumeJson(
    originalJson,
    session.jobDescription.originalText || '',
    acceptedRecommendations
  );

  // Determine next version number in the ResumeGroup
  const existingInGroup = await prisma.resume.findMany({
    where: { groupId: originalResume.groupId },
    orderBy: { version: 'desc' },
    take: 1
  });
  const nextVersion = (existingInGroup[0]?.version || 1) + 1;

  // Save new Version as a new Resume record (PDF documentId is null)
  const newResume = await prisma.resume.create({
    data: {
      userId: user.id,
      groupId: originalResume.groupId,
      documentId: null, // Purely digital resume
      version: nextVersion,
      jdText: session.jobDescription.originalText,
      canonicalJson: newJson as any,
      generationMetadata: {
        sessionId: session.id,
        model: 'llama-3-70b-preview', // Or whatever model is used
        timestamp: new Date().toISOString()
      },
    }
  });

  await prisma.tailoringSession.update({
    where: { id: tailoringSessionId },
    data: { generatedResumeId: newResume.id },
  });

  revalidatePath('/resume-editor');
  revalidatePath('/resume-tailoring');
  return { success: true, newResumeId: newResume.id, json: newJson, originalJson, version: nextVersion };
}

export async function updateResumeJsonAction(resumeId: string, newJson: any) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  await prisma.resume.updateMany({
    where: { id: resumeId, userId: user.id },
    data: { canonicalJson: newJson }
  });

  return { success: true };
}

export async function getResumeJsonAction(resumeId: string) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  const resume = await prisma.resume.findUnique({
    where: { id: resumeId, userId: user.id }
  });
  if (!resume) throw new Error('Resume not found');

  return { success: true, json: resume.canonicalJson, version: resume.version, metadata: resume.generationMetadata };
}
