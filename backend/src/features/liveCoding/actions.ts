'use server';

import {
  CodingProblemRepository,
  CodingSessionRepository,
  CodingSubmissionRepository,
} from './repository';
import { LiveCodingService } from './service';
import { requireSessionUser, getSessionUser } from '../../auth/session';
import type { CodingDifficulty, SubmissionRecord, WorkspaceProblem } from './types';
import { loadProblemBySlug } from '../dsa/problemLoader';

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
    referenceSolutions: (problem as any).referenceSolutions,
    inputHelper: (problem as any).inputHelper,

    sampleTests: asArray<WorkspaceProblem['sampleTests'][number]>(problem.sampleTests).map(
      (testCase) => ({
        ...testCase,
        displayInput: testCase.displayInput ?? testCase.input,
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

export async function getProblemBySlugAction(slug: string): Promise<WorkspaceProblem | null> {
  const bundle = loadProblemBySlug(slug);
  if (bundle) {
    const meta = bundle.metadata;

    const sampleTests = bundle.visibleTests.map((vt: any, idx: number) => {
      const correspondingExample = meta.examples && meta.examples[idx] ? meta.examples[idx] : null;
      return {
        id: vt.id || `sample-${idx + 1}`,
        input: vt.input,
        expectedOutput: vt.expectedOutput,
        explanation: vt.explanation || correspondingExample?.explanation || '',
      };
    });

    const hiddenTests = bundle.hiddenTests.map((ht: any, idx: number) => ({
      id: ht.id || `hidden-${idx + 1}`,
      input: ht.input,
      expectedOutput: ht.expectedOutput,
      explanation: ht.explanation || '',
    }));

    return {
      id: meta.id,
      slug: meta.slug,
      title: meta.title,
      difficulty: meta.difficulty,
      description: meta.description,
      primaryTopic: meta.primaryTopic,
      topics: [{ id: meta.topicId || meta.primaryTopic, name: meta.primaryTopic, slug: meta.primaryTopic }],
      pattern: meta.pattern,
      technique: meta.technique,
      importance: meta.importance,
      interviewFrequency: meta.interviewFrequency,
      estimatedSolveTime: meta.estimatedSolveTime,
      dataStructuresUsed: meta.dataStructuresUsed,
      companies: (meta.companies || []).map((c: any) =>
        typeof c === 'string'
          ? { id: c.toLowerCase(), name: c, slug: c.toLowerCase() }
          : { id: c.id || c.slug || c.name?.toLowerCase(), name: c.name, slug: c.slug || c.name?.toLowerCase() }
      ),
      recognitionClues: meta.recognitionClues,
      keywords: meta.keywords,
      examples: meta.examples || [],
      constraints: meta.constraints || [],
      sampleTests,
      hiddenTests,
      hints: meta.hints || [],
      editorial: bundle.editorialMarkdown || meta.approach || '',
      intuition: meta.intuition,
      approach: meta.approach,
      pseudocode: meta.pseudocode,
      referenceSolutions: bundle.referenceSolutions || (meta as any).referenceSolutions || {},
      starterCode: (meta as any).starterCode || {},
      inputTemplates: (meta as any).inputTemplates || {},
      starterMetadata: meta.starterMetadata,
      executionMetadata: meta.executionMetadata,
      driverMetadata: meta.driverMetadata,
    } as any;
  }

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
export async function recordSubmissionAction(payload: any): Promise<{ success: boolean }> {
  try {
    const user = await getSessionUser();
    if (user && payload && typeof payload === 'object' && payload.problemSlug) {
      const session = payload.sessionId
        ? await CodingSessionRepository.getSessionById(payload.sessionId, user.id)
        : await CodingSessionRepository.getOrCreateSession(user.id, payload.problemSlug, payload.language || 'javascript');

      if (session) {
        await CodingSubmissionRepository.createSubmission({
          sessionId: session.id,
          userId: user.id,
          codeSnapshot: payload.codeSnapshot || payload.code || '',
          language: payload.language || 'javascript',
          status: payload.status || 'ACCEPTED',
          executionTimeMs: payload.executionTimeMs || 0,
          memoryBytes: payload.memoryBytes || 0,
          passedCount: payload.passedCount || 0,
          totalCount: payload.totalCount || 0,
        });

        if (payload.status === 'ACCEPTED') {
          await CodingSessionRepository.updateSession(session.id, {
            status: 'COMPLETED',
            completedAt: new Date(),
            code: payload.codeSnapshot || payload.code || '',
            language: payload.language || 'javascript',
          });
          await LiveCodingService.recalculateProgress(user.id);
        }
      }
    }
  } catch {
    // Return success gracefully
  }
  return { success: true };
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
): Promise<{ success: boolean }> {
  try {
    const user = await getSessionUser();
    if (user) {
      await CodingSessionRepository.saveSessionCode(user.id, problemSlug, code, language);
    }
  } catch {
    // ignore
  }
  return { success: true };
}

export async function getSavedCodeAction(
  problemSlug: string
): Promise<{ code: string; language: string } | null> {
  try {
    const user = await getSessionUser();
    if (!user) return null;
    return await CodingSessionRepository.getSavedCode(user.id, problemSlug);
  } catch {
    return null;
  }
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
