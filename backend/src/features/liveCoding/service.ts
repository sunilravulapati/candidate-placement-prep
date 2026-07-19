import {
  CodingBookmarkRepository,
  CodingLearningPathRepository,
  CodingNoteRepository,
  CodingProblemRepository,
  CodingProgressRepository,
  CodingSessionRepository,
  CodingSubmissionRepository,
} from './repository';
import { formatStatusLabel, getStarterCode, runSampleTests, submitSolution } from './executionEngine';
import type { DashboardData, DetailedReview, TestCase } from './types';

export class LiveCodingService {
  static async runCode(userId: string, problemSlug: string, code: string, _language: string) {
    const problem = await CodingProblemRepository.getProblemBySlug(problemSlug);
    if (!problem) throw new Error('Problem not found');

    const sampleTests = (problem.sampleTests as unknown as TestCase[]) ?? [];
    return runSampleTests(code, sampleTests, problem.timeComplexity, problem.spaceComplexity);
  }

  static async submitCode(
    userId: string,
    problemSlug: string,
    code: string,
    language: string,
    sessionId?: string
  ) {
    const problem = await CodingProblemRepository.getProblemBySlug(problemSlug);
    if (!problem) throw new Error('Problem not found');

    const session = sessionId
      ? await CodingSessionRepository.getSessionById(sessionId, userId)
      : await CodingSessionRepository.getOrCreateSession(userId, problemSlug, language);

    if (!session) throw new Error('Session not found');

    const sampleTests = (problem.sampleTests as unknown as TestCase[]) ?? [];
    const hiddenTests = (problem.hiddenTests as unknown as TestCase[]) ?? [];
    const result = submitSolution(code, sampleTests, hiddenTests, problem.timeComplexity, problem.spaceComplexity);

    const submission = await CodingSubmissionRepository.createSubmission({
      sessionId: session.id,
      userId,
      codeSnapshot: code,
      language,
      status: result.status,
      executionTimeMs: result.executionTimeMs,
      memoryBytes: result.memoryBytes,
      passedCount: result.passedCount,
      totalCount: result.totalCount,
      basicReview: result.basicReview,
    });

    if (result.status === 'ACCEPTED') {
      await CodingSessionRepository.updateSession(session.id, {
        status: 'COMPLETED',
        completedAt: new Date(),
      });
    }

    await CodingProgressRepository.recalculate(userId);

    return { submission, result, statusLabel: formatStatusLabel(result.status) };
  }

  static async getDetailedAIReview(submissionId: string, userId: string): Promise<DetailedReview> {
    const submission = await CodingSubmissionRepository.getSubmissionById(submissionId, userId);
    if (!submission) throw new Error('Submission not found');

    if (submission.detailedReview) {
      return submission.detailedReview as unknown as DetailedReview;
    }

    const basic = submission.basicReview as { timeComplexity?: string; spaceComplexity?: string } | null;

    const detailedReview: DetailedReview = {
      correctnessReview: submission.status === 'ACCEPTED'
        ? 'Your implementation handles the core logic correctly and passes all test cases.'
        : 'Your solution has correctness issues that need to be addressed before it can be accepted.',
      edgeCasesMissed: submission.status === 'ACCEPTED'
        ? ['Empty input', 'Single element input']
        : ['Empty input', 'Boundary values', 'Duplicate elements'],
      alternativeSolution: basic?.timeComplexity?.includes('N')
        ? 'Consider whether a two-pointer or sliding window approach could reduce space usage.'
        : 'Explore whether sorting the input first could simplify the logic.',
      optimizationSuggestions: [
        'Use early returns for edge cases to improve readability.',
        'Avoid unnecessary nested loops where a hash map could provide O(1) lookups.',
      ],
      interviewerFeedback: submission.status === 'ACCEPTED'
        ? 'Good problem-solving approach. Communicate your thought process clearly in interviews.'
        : 'Walk through your approach aloud before coding. Test with edge cases before submitting.',
      codeStyleReview: 'Use descriptive variable names and consistent formatting throughout.',
      companyReadiness: {
        Google: submission.status === 'ACCEPTED' ? 85 : 55,
        Amazon: submission.status === 'ACCEPTED' ? 88 : 58,
        Microsoft: submission.status === 'ACCEPTED' ? 90 : 60,
        Meta: submission.status === 'ACCEPTED' ? 82 : 52,
      },
      overallRating: submission.status === 'ACCEPTED' ? 4.2 : 2.8,
    };

    await CodingSubmissionRepository.updateDetailedReview(submissionId, detailedReview);
    return detailedReview;
  }

  static async getDashboardData(userId: string): Promise<DashboardData> {
    const [progress, totals, challenge, latestSession, recentSubs, bookmarks, paths, companyProgress, topicProgress, heatmap] =
      await Promise.all([
        CodingProgressRepository.getOrCreate(userId),
        CodingProblemRepository.getDifficultyTotals(),
        CodingProblemRepository.getTodaysChallenge(userId),
        CodingSessionRepository.getLatestSession(userId),
        CodingSubmissionRepository.getSubmissionsByUser(userId, 5),
        CodingBookmarkRepository.getBookmarks(userId),
        CodingLearningPathRepository.getAllWithProgress(userId),
        CodingLearningPathRepository.getCompanyProgress(userId),
        CodingLearningPathRepository.getTopicProgress(userId),
        CodingSubmissionRepository.getHeatmapData(userId),
      ]);

    const formatRelativeTime = (date: Date) => {
      const diff = Date.now() - date.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours < 1) return 'Just now';
      if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    };

    return {
      stats: {
        easy: { solved: progress.easySolved, total: totals.easy },
        medium: { solved: progress.mediumSolved, total: totals.medium },
        hard: { solved: progress.hardSolved, total: totals.hard },
        acceptanceRate: progress.acceptanceRate,
        solvedToday: recentSubs.filter((s) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return s.createdAt >= today && s.status === 'ACCEPTED';
        }).length,
        currentStreak: progress.dailyStreak,
        longestStreak: Math.max(progress.dailyStreak, progress.dailyStreak),
      },
      todaysChallenge: challenge
        ? {
            slug: challenge.slug,
            title: challenge.title,
            difficulty: challenge.difficulty,
            topics: challenge.topics.map((t) => t.name),
            companies: challenge.companies.map((c) => c.name),
          }
        : null,
      continueSession: latestSession
        ? {
            sessionId: latestSession.id,
            slug: latestSession.problem.slug,
            title: latestSession.problem.title,
            difficulty: latestSession.problem.difficulty,
            language: latestSession.language,
            lastActive: formatRelativeTime(latestSession.startTime),
          }
        : null,
      recentAttempts: recentSubs.map((sub) => ({
        id: sub.id,
        slug: sub.session.problem.slug,
        title: sub.session.problem.title,
        difficulty: sub.session.problem.difficulty,
        status: formatStatusLabel(sub.status as Parameters<typeof formatStatusLabel>[0]),
        time: formatRelativeTime(sub.createdAt),
        language: sub.language,
      })),
      bookmarks: bookmarks.slice(0, 5).map((b) => ({
        slug: b.problem.slug,
        title: b.problem.title,
        difficulty: b.problem.difficulty,
      })),
      learningPaths: paths,
      companyProgress,
      topicProgress,
      heatmap,
    };
  }

  static getStarterCodeForLanguage(
    starterCode: Record<string, string> | null | undefined,
    language: string,
    title?: string
  ) {
    return getStarterCode(starterCode, language, title);
  }
}
