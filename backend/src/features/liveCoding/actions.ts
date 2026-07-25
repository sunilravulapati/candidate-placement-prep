'use server';

import {
  CodingProblemRepository,
  CodingSessionRepository,
  CodingSubmissionRepository,
} from './repository';
import { LiveCodingService } from './service';
import { requireSessionUser, getSessionUser } from '../../auth/session';
import type { CodingDifficulty, SubmissionRecord, WorkspaceProblem } from './types';

// ── Helpers ────────────────────────────────────────────────────────────────────

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string'
    )
  );
}

function toWorkspaceProblem(
  problem: Awaited<ReturnType<typeof CodingProblemRepository.getProblemBySlug>>
): WorkspaceProblem | null {
  if (!problem) return null;
  const examples = asArray<WorkspaceProblem['examples'][number]>(problem.examples);

  return {
    questionNo: (problem as any).questionNo,
    slug: problem.slug,
    title: problem.title,
    difficulty: problem.difficulty as CodingDifficulty,
    importance: (problem as any).importance,
    interviewFrequency: (problem as any).interviewFrequency,
    estimatedSolveTime: (problem as any).estimatedSolveTime,
    description: problem.description,
    whyLearnThis: (problem as any).whyLearnThis,
    recognitionClues: (problem as any).recognitionClues,
    prerequisites: (problem as any).prerequisites,
    concepts: (problem as any).concepts,
    keywords: (problem as any).keywords,
    primaryTopic: (problem as any).primaryTopic,
    secondaryTopics: (problem as any).secondaryTopics,
    pattern: (problem as any).pattern,
    patternId: (problem as any).patternId,
    technique: (problem as any).technique,
    techniqueId: (problem as any).techniqueId,
    dataStructuresUsed: (problem as any).dataStructuresUsed,
    learningPath: (problem as any).learningPath,
    constraints: problem.constraints ?? [],
    examples,
    starterCode: asRecord(problem.starterCode),
    starterMetadata: (problem as any).starterMetadata,
    executionMetadata: (problem as any).executionMetadata,
    driverMetadata: (problem as any).driverMetadata,
    editorial: problem.editorial,
    hints: problem.hints ?? [],

    optimalTC: (problem as any).optimalTC,
    optimalSC: (problem as any).optimalSC,
    bruteTC: (problem as any).bruteTC,
    bruteSC: (problem as any).bruteSC,

    approach: (problem as any).approach,
    intuition: (problem as any).intuition,
    algorithm: (problem as any).algorithm,
    pseudocode: (problem as any).pseudocode,
    commonMistakes: (problem as any).commonMistakes,
    edgeCases: (problem as any).edgeCases,
    interviewTrick: (problem as any).interviewTrick,
    revisionNotes: (problem as any).revisionNotes,

    followUps: (problem as any).followUps,
    variants: (problem as any).variants,
    relatedProblems: (problem as any).relatedProblems,
    resources: (problem as any).resources,
    inputTemplates: (problem as any).inputTemplates,

    sampleTests: asArray<WorkspaceProblem['sampleTests'][number]>(problem.sampleTests).map(
      (testCase, index) => ({
        ...testCase,
        displayInput: testCase.displayInput ?? examples[index]?.input ?? testCase.input,
      })
    ),
    hiddenTests: asArray<WorkspaceProblem['hiddenTests'][number]>(problem.hiddenTests),
    companies: problem.companies.map((c) => ({ name: c.name, slug: c.slug })),
    topics: problem.topics.map((t) => ({ name: t.name, slug: t.slug })),
    tags: problem.tags.map((t) => ({ name: t.name, slug: t.slug })),
    expectedApproach: problem.expectedApproach,
    timeComplexity: problem.timeComplexity,
    spaceComplexity: problem.spaceComplexity,
    estimatedTime: problem.estimatedTime,
  };
}

// ── Problem Library ────────────────────────────────────────────────────────────

export async function getPaginatedProblemsAction(params: {
  page: number;
  limit: number;
  search?: string;
  difficulty?: string;
  topic?: string;
  company?: string;
  status?: string;
}) {
  const { page, limit, search, difficulty, topic, company, status } = params;
  const offset = (page - 1) * limit;
  const user = await getSessionUser();

  const filters = {
    search: search || undefined,
    difficulty: difficulty ? (difficulty.toUpperCase() as CodingDifficulty) : undefined,
    topic: topic || undefined,
    company: company || undefined,
    status: status as Parameters<typeof CodingProblemRepository.searchProblems>[0]['status'] | undefined,
    userId: user?.id,
    limit,
    offset,
  };

  const [problems, total] = await Promise.all([
    CodingProblemRepository.searchProblems(filters),
    CodingProblemRepository.countProblems(filters),
  ]);

  return { problems, total, page, totalPages: Math.ceil(total / limit) };
}

export async function getProblemBySlugAction(slug: string) {
  if (!slug || slug.trim().length === 0) return null;
  const problem = await CodingProblemRepository.getProblemBySlug(slug);
  return toWorkspaceProblem(problem);
}

export async function getProblemNavigationAction(slug: string) {
  const problems = await CodingProblemRepository.getAllProblems();
  const ordered = problems.map((p) => ({ slug: p.slug, title: p.title }));
  const currentIndex = ordered.findIndex((p) => p.slug === slug);
  if (currentIndex === -1) return { previous: null, next: null };
  return {
    previous: currentIndex > 0 ? ordered[currentIndex - 1] : null,
    next: currentIndex < ordered.length - 1 ? ordered[currentIndex + 1] : null,
  };
}

// ── Dashboard ──────────────────────────────────────────────────────────────────

export async function getDashboardDataAction() {
  const user = await requireSessionUser();
  return LiveCodingService.getDashboardData(user.id);
}

// ── Judge / Execution ──────────────────────────────────────────────────────────

/**
 * Record a submission verdict to the database.
 * Actual code execution happens client-side via ExecutionProvider (Judge0 or mock).
 * This action persists the result and updates progress/stats.
 */
export async function recordSubmissionAction(record: SubmissionRecord) {
  const user = await requireSessionUser();
  const userId = user.id;

  // Get or create the session for this problem
  const session = record.sessionId
    ? await CodingSessionRepository.getSessionById(record.sessionId, userId)
    : await CodingSessionRepository.getOrCreateSession(userId, record.problemSlug, record.language);

  if (!session) throw new Error('Session not found or could not be created');

  // Create the submission record
  const submission = await CodingSubmissionRepository.createSubmission({
    sessionId: session.id,
    userId,
    codeSnapshot: record.codeSnapshot,
    language: record.language,
    status: record.status,
    executionTimeMs: record.executionTimeMs,
    memoryBytes: record.memoryBytes,
    passedCount: record.passedCount,
    totalCount: record.totalCount,
  });

  // Only update progress on Accepted — Wrong Answer should NOT count as solved
  if (record.status === 'ACCEPTED') {
    await CodingSessionRepository.updateSession(session.id, {
      status: 'COMPLETED',
      completedAt: new Date(),
      code: record.codeSnapshot,
      language: record.language,
    });
    await LiveCodingService.recalculateProgress(userId);
  } else {
    // Still persist code but keep session active
    await CodingSessionRepository.updateSession(session.id, {
      code: record.codeSnapshot,
      language: record.language,
    });
  }

  return { submissionId: submission.id, status: record.status };
}

/**
 * Get full submission history for the current user.
 */
export async function getSubmissionHistoryAction(filters?: {
  status?: string;
  language?: string;
  limit?: number;
}) {
  const user = await requireSessionUser();
  const limit = filters?.limit ?? 100;
  const submissions = await CodingSubmissionRepository.getSubmissionsByUser(user.id, limit);

  return submissions
    .filter((s) => {
      if (filters?.status && s.status !== filters.status) return false;
      if (filters?.language && s.language !== filters.language) return false;
      return true;
    })
    .map((s) => ({
      id: s.id,
      problemSlug: s.session.problem.slug,
      problemTitle: s.session.problem.title,
      difficulty: s.session.problem.difficulty,
      language: s.language,
      status: s.status,
      executionTimeMs: s.executionTimeMs,
      memoryBytes: s.memoryBytes,
      passedCount: s.passedCount,
      totalCount: s.totalCount,
      createdAt: s.createdAt,
    }));
}

// ── Session Persistence ────────────────────────────────────────────────────────

/**
 * Auto-save code to DB for continue-session across devices.
 */
export async function saveSessionCodeAction(
  problemSlug: string,
  code: string,
  language: string
) {
  const user = await requireSessionUser();
  return CodingSessionRepository.saveSessionCode(user.id, problemSlug, code, language);
}

/**
 * Load saved code from DB for a problem (used on workspace init).
 */
export async function getSavedCodeAction(
  problemSlug: string
): Promise<{ code: string; language: string } | null> {
  const user = await getSessionUser();
  if (!user) return null;
  return CodingSessionRepository.getSavedCode(user.id, problemSlug);
}

// ── Bookmarks ─────────────────────────────────────────────────────────────────

export async function toggleBookmarkAction(problemSlug: string) {
  const user = await requireSessionUser();
  const { CodingBookmarkRepository } = await import('./repository');
  return CodingBookmarkRepository.toggleBookmark(user.id, problemSlug);
}

// ── Notes ─────────────────────────────────────────────────────────────────────

export async function getNoteAction(problemSlug: string) {
  const user = await getSessionUser();
  if (!user) return null;
  const { CodingNoteRepository } = await import('./repository');
  return CodingNoteRepository.getNote(user.id, problemSlug);
}

export async function saveNoteAction(problemSlug: string, content: string) {
  const user = await requireSessionUser();
  const { CodingNoteRepository } = await import('./repository');
  return CodingNoteRepository.saveNote(user.id, problemSlug, content);
}
