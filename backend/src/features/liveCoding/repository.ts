import prisma from '../../db/client';
import type { CodingDifficulty, ProblemFilters, ProblemStatus, SortOption } from './types';
import { TOPIC_FILTER_MAP } from './types';
import fs from 'fs';
import path from 'path';

const QUESTION_DATA_FILES = [
  'arrays-strings.json',
  'searching-sorting.json',
  'stacks-queues.json',
  'greedy.json',
  'linked-lists.json',
  'recursion-backtracking.json',
  'dynamic-programming.json',
  'graphs.json',
  'trees.json',
];

type StaticProblem = {
  slug: string;
  title: string;
  difficulty: CodingDifficulty;
  description: string;
  constraints?: string[];
  examples?: unknown;
  starterCode?: unknown;
  hints?: string[];
  sampleTests?: unknown;
  hiddenTests?: unknown;
  companies?: string[];
  topics?: string[];
  tags?: string[];
  expectedApproach?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  estimatedTime?: number;
};

function toSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function loadStaticProblems(): StaticProblem[] {
  const dataDirCandidates = [
    path.join(process.cwd(), 'backend', 'data', 'questions'),
    path.join(process.cwd(), '..', 'backend', 'data', 'questions'),
  ];
  const dataDir = dataDirCandidates.find((candidate) => fs.existsSync(candidate));
  if (!dataDir) return [];

  return QUESTION_DATA_FILES.flatMap((file) => {
    const filePath = path.join(dataDir, file);
    if (!fs.existsSync(filePath)) return [];

    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as StaticProblem[];
    } catch (error) {
      console.warn(`Failed to read static problem data from ${file}:`, (error as Error).message);
      return [];
    }
  });
}

function formatStaticRelation(names: string[] | undefined) {
  return (names ?? []).map((name) => ({ id: toSlug(name), name, slug: toSlug(name) }));
}

function findStaticProblemBySlug(slug: string) {
  const problem = loadStaticProblems().find((p) => p.slug === slug);
  if (!problem) return null;

  return {
    id: problem.slug,
    slug: problem.slug,
    title: problem.title,
    difficulty: problem.difficulty,
    description: problem.description,
    constraints: problem.constraints ?? [],
    examples: problem.examples ?? [],
    starterCode: problem.starterCode ?? {},
    boilerplates: null,
    editorial: null,
    hints: problem.hints ?? [],
    expectedApproach: problem.expectedApproach ?? null,
    timeComplexity: problem.timeComplexity ?? null,
    spaceComplexity: problem.spaceComplexity ?? null,
    estimatedTime: problem.estimatedTime ?? 0,
    acceptanceRate: 0,
    frequency: 0,
    followUpQuestions: [],
    relatedProblems: [],
    sampleTests: problem.sampleTests ?? [],
    hiddenTests: problem.hiddenTests ?? [],
    languages: ['javascript', 'python', 'java', 'cpp'],
    createdAt: new Date(0),
    updatedAt: new Date(0),
    topics: formatStaticRelation(problem.topics),
    companies: formatStaticRelation(problem.companies),
    tags: formatStaticRelation(problem.tags),
  };
}

function buildWhereClause(filters: ProblemFilters) {
  const where: Record<string, unknown> = {};
  const andConditions: Record<string, unknown>[] = [];

  if (filters.search) {
    const term = filters.search.trim();
    andConditions.push({
      OR: [
        { title: { contains: term, mode: 'insensitive' } },
        { tags: { some: { name: { contains: term, mode: 'insensitive' } } } },
        { companies: { some: { name: { contains: term, mode: 'insensitive' } } } },
        { topics: { some: { name: { contains: term, mode: 'insensitive' } } } },
      ],
    });
  }

  if (filters.difficulty) {
    where.difficulty = filters.difficulty.toUpperCase();
  }

  if (filters.topic) {
    const topicSlugs = TOPIC_FILTER_MAP[filters.topic] ?? [filters.topic];
    andConditions.push({
      topics: { some: { slug: { in: topicSlugs } } },
    });
  }

  if (filters.company) {
    andConditions.push({
      companies: { some: { slug: filters.company } },
    });
  }

  if (andConditions.length > 0) {
    where.AND = andConditions;
  }

  return where;
}

function buildOrderBy(sort?: SortOption) {
  switch (sort) {
    case 'newest':
      return { createdAt: 'desc' as const };
    case 'oldest':
      return { createdAt: 'asc' as const };
    case 'acceptance':
      return { acceptanceRate: 'desc' as const };
    case 'difficulty':
      return { difficulty: 'asc' as const };
    case 'alphabetical':
      return { title: 'asc' as const };
    case 'most-solved':
      return { frequency: 'desc' as const };
    case 'least-solved':
      return { frequency: 'asc' as const };
    case 'company-frequency':
      return { frequency: 'desc' as const };
    default:
      return { createdAt: 'desc' as const };
  }
}

async function getUserProblemStatuses(userId: string) {
  const [accepted, attempted, bookmarks] = await Promise.all([
    prisma.codingSubmission.findMany({
      where: { userId, status: 'ACCEPTED' },
      include: { session: { select: { problemId: true } } },
    }),
    prisma.codingSubmission.findMany({
      where: { userId },
      include: { session: { select: { problemId: true } } },
    }),
    prisma.codingBookmark.findMany({
      where: { userId },
      select: { problemId: true },
    }),
  ]);

  const solved = new Set(accepted.map((s) => s.session.problemId));
  const attemptedSet = new Set(attempted.map((s) => s.session.problemId));
  const bookmarked = new Set(bookmarks.map((b) => b.problemId));

  return { solved, attempted: attemptedSet, bookmarked };
}

function resolveStatus(
  problemId: string,
  solved: Set<string>,
  attempted: Set<string>,
  bookmarked: Set<string>
): ProblemStatus {
  if (solved.has(problemId)) return 'SOLVED';
  if (attempted.has(problemId)) return 'ATTEMPTED';
  if (bookmarked.has(problemId)) return 'BOOKMARKED';
  return 'NOT_STARTED';
}

export class CodingProblemRepository {
  static async getAllProblems() {
    try {
      const problems = await prisma.codingProblem.findMany({
        include: { topics: true, companies: true, tags: true },
        orderBy: { createdAt: 'asc' },
      });
      if (problems.length === 0) {
        return loadStaticProblems().map((problem) => ({
          ...findStaticProblemBySlug(problem.slug)!,
        }));
      }
      return problems;
    } catch (error) {
      console.warn('Problem list query failed, falling back to static problem data. Reason:', (error as Error).message);
      return loadStaticProblems().map((problem) => ({
        ...findStaticProblemBySlug(problem.slug)!,
      }));
    }
  }

  static async getProblemBySlug(slug: string) {
    try {
      const problem = await prisma.codingProblem.findUnique({
        where: { slug },
        include: { topics: true, companies: true, tags: true },
      });
      return problem ?? findStaticProblemBySlug(slug);
    } catch (error) {
      console.warn(`Problem lookup for slug "${slug}" failed, falling back to static data. Reason:`, (error as Error).message);
      return findStaticProblemBySlug(slug);
    }
  }

  static async getProblemsByTopic(topicSlug: string) {
    return prisma.codingProblem.findMany({
      where: { topics: { some: { slug: topicSlug } } },
      include: { topics: true, companies: true, tags: true },
    });
  }

  static async searchProblems(filters: ProblemFilters) {
    const where = buildWhereClause(filters);
    let problems = await prisma.codingProblem.findMany({
      where,
      include: { topics: true, companies: true, tags: true },
      orderBy: buildOrderBy(filters.sort),
    });

    if (filters.userId) {
      const { solved, attempted, bookmarked } = await getUserProblemStatuses(filters.userId);

      if (filters.status) {
        problems = problems.filter((p) => {
          const status = resolveStatus(p.id, solved, attempted, bookmarked);
          if (filters.status === 'BOOKMARKED') return bookmarked.has(p.id);
          return status === filters.status;
        });
      }

      if (filters.bookmarked) {
        problems = problems.filter((p) => bookmarked.has(p.id));
      }

      return problems.map((p) => ({
        ...p,
        status: resolveStatus(p.id, solved, attempted, bookmarked),
        isBookmarked: bookmarked.has(p.id),
      }));
    }

    return problems.map((p) => ({ ...p, status: 'NOT_STARTED' as ProblemStatus, isBookmarked: false }));
  }

  static async countProblems(filters: ProblemFilters) {
    if (filters.status || filters.bookmarked) {
      const results = await this.searchProblems({ ...filters, limit: undefined, offset: undefined });
      return results.length;
    }
    const where = buildWhereClause(filters);
    return prisma.codingProblem.count({ where });
  }

  static async getDifficultyTotals() {
    const [easy, medium, hard] = await Promise.all([
      prisma.codingProblem.count({ where: { difficulty: 'EASY' } }),
      prisma.codingProblem.count({ where: { difficulty: 'MEDIUM' } }),
      prisma.codingProblem.count({ where: { difficulty: 'HARD' } }),
    ]);
    return { easy, medium, hard };
  }

  static async getTodaysChallenge(userId: string) {
    const { solved, attempted } = await getUserProblemStatuses(userId);
    const problems = await prisma.codingProblem.findMany({
      include: { topics: true, companies: true },
      orderBy: { createdAt: 'asc' },
    });

    const unsolved = problems.filter((p) => !solved.has(p.id));
    if (unsolved.length === 0) return null;

    const dayIndex = new Date().getDate() % unsolved.length;
    const challenge = unsolved[dayIndex];
    const lastAttempted = [...attempted].length;

    return {
      ...challenge,
      priority: lastAttempted,
    };
  }
}

export class CodingSessionRepository {
  static async getOrCreateSession(userId: string, problemSlug: string, language = 'javascript') {
    const problem = await CodingProblemRepository.getProblemBySlug(problemSlug);
    if (!problem) throw new Error('Problem not found');

    const existing = await prisma.codingSession.findFirst({
      where: { userId, problemId: problem.id, status: 'ACTIVE' },
      include: { problem: { include: { topics: true, companies: true, tags: true } } },
      orderBy: { startTime: 'desc' },
    });

    if (existing) return existing;

    return prisma.codingSession.create({
      data: {
        userId,
        problemId: problem.id,
        language,
        status: 'ACTIVE',
      },
      include: { problem: { include: { topics: true, companies: true, tags: true } } },
    });
  }

  static async getLatestSession(userId: string) {
    return prisma.codingSession.findFirst({
      where: { userId, status: 'ACTIVE' },
      include: { problem: { include: { topics: true, companies: true } } },
      orderBy: { startTime: 'desc' },
    });
  }

  static async getSessionById(sessionId: string, userId: string) {
    return prisma.codingSession.findFirst({
      where: { id: sessionId, userId },
      include: { problem: { include: { topics: true, companies: true, tags: true } } },
    });
  }

  static async getSessionBySlug(userId: string, slug: string) {
    const problem = await CodingProblemRepository.getProblemBySlug(slug);
    if (!problem) return null;
    return prisma.codingSession.findFirst({
      where: { userId, problemId: problem.id },
      include: { problem: { include: { topics: true, companies: true, tags: true } } },
      orderBy: { startTime: 'desc' },
    });
  }

  static async updateSession(
    sessionId: string,
    data: { code?: string; language?: string; status?: string; completedAt?: Date }
  ) {
    return prisma.codingSession.update({
      where: { id: sessionId },
      data,
    });
  }

  static async saveSnapshot(sessionId: string, code: string) {
    return prisma.codeSnapshot.create({
      data: { sessionId, code },
    });
  }
}

export class CodingSubmissionRepository {
  static async createSubmission(data: {
    sessionId: string;
    userId: string;
    codeSnapshot: string;
    language: string;
    status: string;
    executionTimeMs?: number;
    memoryBytes?: number;
    passedCount: number;
    totalCount: number;
    basicReview?: unknown;
    detailedReview?: unknown;
  }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return prisma.codingSubmission.create({ data: data as any });
  }

  static async getSubmissionsByUser(userId: string, limit = 50) {
    return prisma.codingSubmission.findMany({
      where: { userId },
      include: {
        session: {
          include: {
            problem: { select: { slug: true, title: true, difficulty: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  static async getSubmissionById(submissionId: string, userId: string) {
    return prisma.codingSubmission.findFirst({
      where: { id: submissionId, userId },
    });
  }

  static async updateDetailedReview(submissionId: string, detailedReview: any) {
    return prisma.codingSubmission.update({
      where: { id: submissionId },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { detailedReview: detailedReview as any },
    });
  }

  static async getLatestAccepted(userId: string, problemId: string) {
    return prisma.codingSubmission.findFirst({
      where: {
        userId,
        status: 'ACCEPTED',
        session: { problemId },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getHeatmapData(userId: string, weeks = 5, daysPerWeek = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - weeks * daysPerWeek + 1);

    const submissions = await prisma.codingSubmission.findMany({
      where: { userId, createdAt: { gte: startDate } },
      select: { createdAt: true },
    });

    const counts = new Map<string, number>();
    for (const sub of submissions) {
      const key = sub.createdAt.toISOString().slice(0, 10);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    const heatmap: number[][] = [];
    for (let w = 0; w < weeks; w++) {
      const row: number[] = [];
      for (let d = 0; d < daysPerWeek; d++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + w * daysPerWeek + d);
        const key = date.toISOString().slice(0, 10);
        row.push(counts.get(key) ?? 0);
      }
      heatmap.push(row);
    }
    return heatmap;
  }
}

export class CodingProgressRepository {
  static async getOrCreate(userId: string) {
    return prisma.codingProgress.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
  }

  static async recalculate(userId: string) {
    const accepted = await prisma.codingSubmission.findMany({
      where: { userId, status: 'ACCEPTED' },
      include: { session: { include: { problem: true } } },
    });

    const uniqueSolved = new Map<string, CodingDifficulty>();
    for (const sub of accepted) {
      uniqueSolved.set(sub.session.problemId, sub.session.problem.difficulty as CodingDifficulty);
    }

    let easySolved = 0;
    let mediumSolved = 0;
    let hardSolved = 0;
    for (const diff of uniqueSolved.values()) {
      if (diff === 'EASY') easySolved++;
      else if (diff === 'MEDIUM') mediumSolved++;
      else hardSolved++;
    }

    const totalSubmissions = await prisma.codingSubmission.count({ where: { userId } });
    const acceptedCount = accepted.length;
    const acceptanceRate = totalSubmissions > 0 ? (acceptedCount / totalSubmissions) * 100 : 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const solvedToday = accepted.filter((s) => s.createdAt >= today).length;

    const existing = await this.getOrCreate(userId);
    const lastSolved = accepted[0]?.createdAt ?? existing.lastSolvedAt;
    let dailyStreak = existing.dailyStreak;

    if (lastSolved) {
      const lastDate = new Date(lastSolved);
      lastDate.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 0) dailyStreak = Math.max(dailyStreak, 1);
      else if (diffDays === 1) dailyStreak += 1;
      else if (diffDays > 1) dailyStreak = solvedToday > 0 ? 1 : 0;
    }

    return prisma.codingProgress.update({
      where: { userId },
      data: {
        easySolved,
        mediumSolved,
        hardSolved,
        totalAttempted: totalSubmissions,
        acceptanceRate: Math.round(acceptanceRate * 10) / 10,
        dailyStreak,
        lastSolvedAt: lastSolved,
      },
    });
  }
}

export class CodingBookmarkRepository {
  static async toggleBookmark(userId: string, problemSlug: string) {
    const problem = await CodingProblemRepository.getProblemBySlug(problemSlug);
    if (!problem) throw new Error('Problem not found');

    const existing = await prisma.codingBookmark.findUnique({
      where: { userId_problemId: { userId, problemId: problem.id } },
    });

    if (existing) {
      await prisma.codingBookmark.delete({ where: { id: existing.id } });
      return { bookmarked: false };
    }

    await prisma.codingBookmark.create({
      data: { userId, problemId: problem.id },
    });
    return { bookmarked: true };
  }

  static async getBookmarks(userId: string) {
    return prisma.codingBookmark.findMany({
      where: { userId },
      include: { problem: { include: { topics: true, companies: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export class CodingNoteRepository {
  static async getNote(userId: string, problemSlug: string) {
    const problem = await CodingProblemRepository.getProblemBySlug(problemSlug);
    if (!problem) return null;
    return prisma.codingNote.findFirst({
      where: { userId, problemId: problem.id },
      orderBy: { updatedAt: 'desc' },
    });
  }

  static async saveNote(userId: string, problemSlug: string, content: string) {
    const problem = await CodingProblemRepository.getProblemBySlug(problemSlug);
    if (!problem) throw new Error('Problem not found');

    const existing = await prisma.codingNote.findFirst({
      where: { userId, problemId: problem.id },
    });

    if (existing) {
      return prisma.codingNote.update({
        where: { id: existing.id },
        data: { content },
      });
    }

    return prisma.codingNote.create({
      data: { userId, problemId: problem.id, content },
    });
  }
}

export class CodingLearningPathRepository {
  static async getAllWithProgress(userId: string) {
    const paths = await prisma.codingLearningPath.findMany({
      include: { problems: true },
    });

    const accepted = await prisma.codingSubmission.findMany({
      where: { userId, status: 'ACCEPTED' },
      include: { session: { select: { problemId: true } } },
    });
    const solvedIds = new Set(accepted.map((s) => s.session.problemId));

    return paths.map((path) => {
      const total = path.problems.length;
      const solved = path.problems.filter((p) => solvedIds.has(p.id)).length;
      return {
        slug: path.slug,
        title: path.title,
        description: path.description,
        total,
        solved,
        progress: total > 0 ? Math.round((solved / total) * 100) : 0,
      };
    });
  }

  static async getCompanyProgress(userId: string) {
    const companies = await prisma.codingCompany.findMany({
      include: { problems: true },
    });

    const accepted = await prisma.codingSubmission.findMany({
      where: { userId, status: 'ACCEPTED' },
      include: { session: { select: { problemId: true } } },
    });
    const solvedIds = new Set(accepted.map((s) => s.session.problemId));

    return companies
      .map((c) => ({
        name: c.name,
        slug: c.slug,
        total: c.problems.length,
        solved: c.problems.filter((p) => solvedIds.has(p.id)).length,
      }))
      .filter((c) => c.total > 0)
      .sort((a, b) => b.solved - a.solved)
      .slice(0, 8);
  }

  static async getTopicProgress(userId: string) {
    const topics = await prisma.codingTopic.findMany({
      include: { problems: true },
    });

    const accepted = await prisma.codingSubmission.findMany({
      where: { userId, status: 'ACCEPTED' },
      include: { session: { select: { problemId: true } } },
    });
    const solvedIds = new Set(accepted.map((s) => s.session.problemId));

    return topics
      .map((t) => ({
        name: t.name,
        slug: t.slug,
        total: t.problems.length,
        solved: t.problems.filter((p) => solvedIds.has(p.id)).length,
      }))
      .filter((t) => t.total > 0)
      .sort((a, b) => b.solved - a.solved);
  }
}
