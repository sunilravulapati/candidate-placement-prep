'use server';

import { CodingProblemRepository, CodingSubmissionRepository } from './repository';
import prisma from '../../db/client'; // Assuming prisma client is here for complex queries if needed

// Dummy auth until wired
const getSessionUser = async () => ({ id: 'user_demo_123' });

export async function getPaginatedProblemsAction(params: {
  page: number;
  limit: number;
  search?: string;
  difficulty?: string;
  topic?: string;
  company?: string;
}) {
  const { page, limit, search, difficulty, topic, company } = params;
  const offset = (page - 1) * limit;

  const filters = { search, difficulty, topic, company, limit, offset };
  
  const [problems, total] = await Promise.all([
    CodingProblemRepository.searchProblems(filters),
    CodingProblemRepository.countProblems(filters)
  ]);

  return {
    problems,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
}

export async function getDashboardStatsAction() {
  const user = await getSessionUser();
  const userId = user.id;

  // For the actual implementation we fetch from CodingProgress, but since we are mocking users, 
  // we can just return a stable mocked layout or attempt to fetch CodingProgress and fallback to mock
  
  // Real fetch (if data exists)
  const progress = await prisma.codingProgress.findUnique({ where: { userId } });
  
  // Fallback mock stats for deterministic UI if no progress is found
  const stats = progress ? {
    easy: { solved: progress.easySolved, total: 100 }, 
    medium: { solved: progress.mediumSolved, total: 200 },
    hard: { solved: progress.hardSolved, total: 80 },
    acceptanceRate: progress.acceptanceRate,
    solvedToday: progress.dailyStreak > 0 ? 1 : 0, 
    currentStreak: progress.dailyStreak,
    longestStreak: Math.max(progress.dailyStreak, 10),
  } : {
    easy: { solved: 45, total: 100 },
    medium: { solved: 85, total: 200 },
    hard: { solved: 20, total: 80 },
    acceptanceRate: 68.5,
    solvedToday: 3,
    currentStreak: 12,
    longestStreak: 30,
  };

  const recentAttemptsRaw = await CodingSubmissionRepository.getSubmissionsByUser(userId);
  
  // Get recent attempts, limit to 3, map to required format
  let recentAttempts = recentAttemptsRaw.slice(0, 3).map(sub => ({
    id: sub.id,
    title: `Session ${sub.sessionId.split('_')[2] || 'Problem'}`, // mapped
    difficulty: 'MEDIUM', // Mocked since we didn't join problem
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

  return {
    stats,
    recentAttempts
  };
}
