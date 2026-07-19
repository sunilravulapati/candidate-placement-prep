'use server';

import { CodingProblemRepository, CodingSubmissionRepository } from './repository';
import { LiveCodingService } from './service';
import prisma from '../../db/client';
import type { CodingDifficulty, WorkspaceProblem } from './types';

// Dummy auth matching the seeded database user
const getSessionUser = async () => ({ id: 'user_test_123' });

// ── Problem Library ───────────────────────────────────────────────────────────

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
    userId: user.id,
    limit,
    offset,
  };

  const [problems, total] = await Promise.all([
    CodingProblemRepository.searchProblems(filters),
    CodingProblemRepository.countProblems(filters),
  ]);

  return {
    problems,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

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

function toWorkspaceProblem(problem: Awaited<ReturnType<typeof CodingProblemRepository.getProblemBySlug>>): WorkspaceProblem | null {
  if (!problem) return null;
  const examples = asArray<WorkspaceProblem['examples'][number]>(problem.examples);

  return {
    slug: problem.slug,
    title: problem.title,
    difficulty: problem.difficulty as CodingDifficulty,
    description: problem.description,
    constraints: problem.constraints ?? [],
    examples,
    starterCode: asRecord(problem.starterCode),
    hints: problem.hints ?? [],
    sampleTests: asArray<WorkspaceProblem['sampleTests'][number]>(problem.sampleTests).map((testCase, index) => ({
      ...testCase,
      displayInput: testCase.displayInput ?? examples[index]?.input ?? testCase.input,
    })),
    companies: problem.companies.map((company) => ({
      name: company.name,
      slug: company.slug,
    })),
    topics: problem.topics.map((topic) => ({
      name: topic.name,
      slug: topic.slug,
    })),
    tags: problem.tags.map((tag) => ({
      name: tag.name,
      slug: tag.slug,
    })),
    expectedApproach: problem.expectedApproach,
    timeComplexity: problem.timeComplexity,
    spaceComplexity: problem.spaceComplexity,
    estimatedTime: problem.estimatedTime,
  };
}

export async function getProblemBySlugAction(slug: string) {
  if (!slug || slug.trim().length === 0) return null;
  const problem = await CodingProblemRepository.getProblemBySlug(slug);
  return toWorkspaceProblem(problem);
}

export async function getProblemNavigationAction(slug: string) {
  const problems = await CodingProblemRepository.getAllProblems();
  const ordered = problems.map((problem) => ({
    slug: problem.slug,
    title: problem.title,
  }));
  const currentIndex = ordered.findIndex((problem) => problem.slug === slug);
  if (currentIndex === -1) {
    return { previous: null, next: null };
  }

  return {
    previous: currentIndex > 0 ? ordered[currentIndex - 1] : null,
    next: currentIndex < ordered.length - 1 ? ordered[currentIndex + 1] : null,
  };
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

/**
 * Full dashboard data — backed by LiveCodingService and all repositories.
 * Use this instead of getDashboardStatsAction for the main dashboard.
 */
export async function getDashboardDataAction() {
  console.log("getDashboardDataAction: starting...");
  try {
    const user = await getSessionUser();
    console.log("getDashboardDataAction: user =", user);
    const data = await LiveCodingService.getDashboardData(user.id);
    console.log("getDashboardDataAction: succeeded, returning data");
    return data;
  } catch (err) {
    console.error("getDashboardDataAction: ERROR =", err);
    throw err;
  }
}

/**
 * Lightweight stats-only action — kept for backwards compatibility.
 * @deprecated Use getDashboardDataAction instead.
 */
export async function getDashboardStatsAction() {
  const user = await getSessionUser();
  const userId = user.id;

  const progress = await prisma.codingProgress.findUnique({ where: { userId } });

  const stats = progress
    ? {
        easy: { solved: progress.easySolved, total: 100 },
        medium: { solved: progress.mediumSolved, total: 200 },
        hard: { solved: progress.hardSolved, total: 80 },
        acceptanceRate: progress.acceptanceRate,
        solvedToday: progress.dailyStreak > 0 ? 1 : 0,
        currentStreak: progress.dailyStreak,
        longestStreak: Math.max(progress.dailyStreak, 10),
      }
    : {
        easy: { solved: 45, total: 100 },
        medium: { solved: 85, total: 200 },
        hard: { solved: 20, total: 80 },
        acceptanceRate: 68.5,
        solvedToday: 3,
        currentStreak: 12,
        longestStreak: 30,
      };

  const recentAttemptsRaw = await CodingSubmissionRepository.getSubmissionsByUser(userId);

  let recentAttempts = recentAttemptsRaw.slice(0, 3).map((sub) => ({
    id: sub.id,
    title: `Session ${sub.sessionId.split('_')[2] || 'Problem'}`,
    difficulty: 'MEDIUM',
    status: sub.status === 'ACCEPTED' ? 'Accepted' : 'Wrong Answer',
    time: sub.createdAt.toLocaleDateString(),
  }));

  if (recentAttempts.length === 0) {
    recentAttempts = [
      { id: '1', title: 'Two Sum', difficulty: 'EASY', status: 'Accepted', time: '2 hours ago' },
      { id: '2', title: 'LRU Cache', difficulty: 'MEDIUM', status: 'Wrong Answer', time: '5 hours ago' },
      { id: '3', title: 'Merge K Sorted Lists', difficulty: 'HARD', status: 'Accepted', time: '1 day ago' },
    ];
  }

  return { stats, recentAttempts };
}
