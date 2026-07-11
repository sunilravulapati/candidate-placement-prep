// backend/src/features/mockInterview/actions.ts
// Next.js Server Actions for Mock Interview Studio.
// These are the only public entry points from the frontend.

'use server';

import { revalidatePath } from 'next/cache';
import { getSessionUser } from '../../auth/session';
import { startInterviewSchema, submitAnswerSchema, endInterviewSchema, getSessionSchema } from './schema';
import { InterviewRepository } from './repository';
import {
  orchestrateStartInterview,
  orchestrateSubmitAnswer,
  orchestrateEndInterview,
} from './orchestrator';
import { logger } from '../../core/logger';

// ─────────────────────────────────────────────────────────────────────────────
// Library
// ─────────────────────────────────────────────────────────────────────────────

/** Fetch all public interview templates for the Library tab. */
export async function listInterviewTemplatesAction() {
  const user = await getSessionUser();
  if (!user) throw new Error('Not authenticated');

  const templates = await InterviewRepository.findAllPublicTemplates();
  return templates.map(t => ({
    id: t.id,
    title: t.title,
    type: t.type,
    difficulty: t.difficulty,
    experienceLevel: t.experienceLevel,
    durationMinutes: t.durationMinutes,
    questionCount: t.questionCount,
    topics: t.topics,
    companyStyle: t.companyStyle,
    description: t.description,
    followUpDepth: t.followUpDepth,
    persona: t.persona
      ? {
          id: t.persona.id,
          name: t.persona.name,
          company: t.persona.company,
          communicationTone: t.persona.communicationTone,
        }
      : null,
  }));
}

/** Fetch all public personas for the Start Interview form. */
export async function listPersonasAction() {
  const user = await getSessionUser();
  if (!user) throw new Error('Not authenticated');

  const personas = await InterviewRepository.findAllPublicPersonas();
  return personas.map(p => ({
    id: p.id,
    name: p.name,
    company: p.company,
    role: p.role,
    questioningStyle: p.questioningStyle,
    strictness: p.strictness,
    followUpDepth: p.followUpDepth,
    communicationTone: p.communicationTone,
    evaluationStyle: p.evaluationStyle,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Start Interview
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Starts a new interview session.
 * Validates config → orchestrates plan generation + first question.
 */
export async function startInterviewAction(rawConfig: unknown) {
  const user = await getSessionUser();
  if (!user) throw new Error('Not authenticated');

  const parsed = startInterviewSchema.safeParse(rawConfig);
  if (!parsed.success) {
    throw new Error(`Invalid interview config: ${parsed.error.message}`);
  }

  const config = parsed.data;

  logger.info('[actions] startInterviewAction called', {
    category: 'interview',
    userId: user.id,
    type: config.type,
  });

  // Resolve resume text if resumeId provided (for contextual interviews)
  let resumeText: string | undefined;
  let jobDescriptionText: string | undefined;

  if (config.resumeId) {
    const prisma = (await import('../../db/client')).default;
    const resume = await prisma.resume.findUnique({
      where: { id: config.resumeId },
    });
    if (resume?.canonicalJson) {
      // Serialize the JSON resume to plain text for AI consumption
      resumeText = JSON.stringify(resume.canonicalJson).slice(0, 2000);
    }
  }

  if (config.jobDescriptionId) {
    const prisma = (await import('../../db/client')).default;
    const jd = await prisma.jobDescription.findUnique({
      where: { id: config.jobDescriptionId },
    });
    if (jd?.originalText) {
      jobDescriptionText = jd.originalText.slice(0, 1500);
    }
  }

  const result = await orchestrateStartInterview(user.id, {
    ...config,
    resumeText,
    jobDescriptionText,
  });

  revalidatePath('/mock-interviews');
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// Submit Answer
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Submits a candidate answer and returns the next question (or end signal).
 */
export async function submitAnswerAction(rawInput: unknown) {
  const user = await getSessionUser();
  if (!user) throw new Error('Not authenticated');

  const parsed = submitAnswerSchema.safeParse(rawInput);
  if (!parsed.success) {
    throw new Error(`Invalid answer input: ${parsed.error.message}`);
  }

  const { sessionId, questionId, answerText } = parsed.data;

  // Ownership check
  const session = await InterviewRepository.findSessionById(sessionId);
  if (!session || session.userId !== user.id) {
    throw new Error('Session not found or unauthorized');
  }

  return orchestrateSubmitAnswer(sessionId, questionId, answerText);
}

// ─────────────────────────────────────────────────────────────────────────────
// End Interview
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Ends the interview and triggers the full evaluation + feedback pipeline.
 * May take 15–30s depending on question count.
 */
export async function endInterviewAction(rawInput: unknown) {
  const user = await getSessionUser();
  if (!user) throw new Error('Not authenticated');

  const parsed = endInterviewSchema.safeParse(rawInput);
  if (!parsed.success) {
    throw new Error(`Invalid end interview input: ${parsed.error.message}`);
  }

  const { sessionId, reason } = parsed.data;

  const session = await InterviewRepository.findSessionById(sessionId);
  if (!session || session.userId !== user.id) {
    throw new Error('Session not found or unauthorized');
  }

  if (session.status === 'COMPLETED') {
    const { InterviewService } = await import('./service');
    const finalSession = await InterviewRepository.findSessionById(sessionId);
    return InterviewService.buildSessionSummary(finalSession);
  }

  if (session.status !== 'ACTIVE' && session.status !== 'IN_PROGRESS') {
    throw new Error(`Session is already ${session.status}`);
  }

  if (reason === 'abandoned') {
    const { InterviewService } = await import('./service');
    await InterviewService.abandonSession(sessionId);
    revalidatePath('/mock-interviews');
    return { sessionId, status: 'ABANDONED' };
  }

  const summary = await orchestrateEndInterview(sessionId);
  revalidatePath('/mock-interviews');
  return summary;
}

// ─────────────────────────────────────────────────────────────────────────────
// History & Retrieval
// ─────────────────────────────────────────────────────────────────────────────

/** Fetches all interview sessions for the current user (History tab). */
export async function listInterviewSessionsAction() {
  const user = await getSessionUser();
  if (!user) throw new Error('Not authenticated');

  const sessions = await InterviewRepository.findSessionsByUser(user.id);
  return sessions.map(s => ({
    id: s.id,
    type: s.type,
    difficulty: s.difficulty,
    targetRole: s.targetRole,
    targetCompany: s.targetCompany,
    status: s.status,
    durationMinutes: s.durationMinutes,
    topics: s.topics,
    overallScore: s.score?.overallScore ?? null,
    questionsCount: s._count.questions,
    personaName: s.persona?.name ?? null,
    templateTitle: s.template?.title ?? null,
    startedAt: s.startedAt,
    completedAt: (s as any).completedAt ?? null,
    createdAt: s.createdAt,
  }));
}

/** Fetches a single session with full details (for Feedback tab). */
export async function getInterviewSessionAction(sessionId: unknown) {
  const user = await getSessionUser();
  if (!user) throw new Error('Not authenticated');

  const parsed = getSessionSchema.safeParse(sessionId);
  if (!parsed.success) throw new Error('Invalid session ID');

  const session = await InterviewRepository.findSessionById(parsed.data);
  if (!session || session.userId !== user.id) {
    throw new Error('Session not found or unauthorized');
  }

  const { InterviewService } = await import('./service');
  const summary = InterviewService.buildSessionSummary(session);

  return {
    ...summary,
    session: {
      id: session.id,
      type: session.type,
      difficulty: session.difficulty,
      experienceLevel: session.experienceLevel,
      targetRole: session.targetRole,
      targetCompany: session.targetCompany,
      durationMinutes: session.durationMinutes,
      topics: session.topics,
      language: session.language,
      status: session.status,
      planJson: session.planJson,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      persona: session.persona
        ? { name: session.persona.name, company: session.persona.company }
        : null,
      resume: session.resume
        ? { name: session.resume.group?.name }
        : null,
      questions: session.questions.map((q: any) => ({
        id: q.id,
        questionText: q.questionText,
        category: q.category,
        difficulty: q.difficulty,
        status: q.status,
        isFollowUp: q.isFollowUp,
        orderIndex: q.orderIndex,
        evaluation: q.evaluation ?? null,
        answer: q.messages.find((m: any) => m.role === 'answer')?.content ?? null,
      })),
    },
  };
}

/** Fetches the current active session, if any, for session recovery. */
export async function getActiveSessionAction() {
  const user = await getSessionUser();
  if (!user) return null;

  const sessions = await InterviewRepository.findSessionsByUser(user.id);
  const activeSession = sessions.find(s => s.status === 'ACTIVE' || s.status === 'IN_PROGRESS');
  
  if (!activeSession) return null;
  
  try {
    return await getInterviewSessionAction(activeSession.id);
  } catch (err) {
    logger.error('[actions] Failed to load active session for recovery', { err, sessionId: activeSession.id });
    return null;
  }
}
