// backend/src/features/aptitude/service.ts

import { AptitudeRepository, APTITUDE_TOPICS_META } from './repository';
import {
  AptitudeDashboardStats,
  CustomSessionOptions,
  SessionResultInput,
  TopicProgressDetail,
  AptitudeCategory,
} from './types';

export class AptitudeService {
  /**
   * Helper to shuffle an array.
   */
  private static shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  static async getAptitudeTopics(userId: string) {
    const allQuestions = AptitudeRepository.loadAllQuestions();
    const userProgress = await AptitudeRepository.getProgressForUser(userId);
    const solvedMap = new Set(
      userProgress
        .filter((p) => p.status === 'completed')
        .map((p) => p.questionId)
    );

    const result: Record<AptitudeCategory, Array<{
      id: string;
      name: string;
      totalQuestions: number;
      solvedQuestions: number;
      progress: number;
      isAvailable: boolean;
    }>> = {
      quantitative: [],
      logical: [],
      verbal: [],
      di: [],
    };

    const categories: AptitudeCategory[] = ['quantitative', 'logical', 'verbal', 'di'];

    for (const category of categories) {
      const topics = APTITUDE_TOPICS_META[category];
      for (const topic of topics) {
        // Count questions belonging to this topic slug
        const topicQuestions = allQuestions.filter(
          (q) => q.topic === topic.id && q.category === category
        );
        const totalCount = topicQuestions.length;
        const solvedCount = topicQuestions.filter((q) => solvedMap.has(q.id)).length;
        const progress = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;

        result[category].push({
          id: topic.id,
          name: topic.name,
          totalQuestions: totalCount,
          solvedQuestions: solvedCount,
          progress,
          isAvailable: totalCount > 0,
        });
      }
    }

    return result;
  }

  static async createCustomSession(userId: string, options: CustomSessionOptions) {
    let candidates = AptitudeRepository.getQuestionsByMultipleTopics(
      options.topics,
      options.difficulty !== 'MIXED' ? options.difficulty : undefined
    );

    if (candidates.length === 0) {
      throw new Error('No questions match the selected criteria.');
    }

    // Shuffle and limit
    candidates = this.shuffle(candidates);
    const selectedQuestions = candidates.slice(0, options.questionCount);

    return {
      questions: selectedQuestions,
      timeLimit: options.timeLimit,
      mode: options.mode,
      topics: options.topics,
      difficulty: options.difficulty,
    };
  }

  static async submitSessionResults(userId: string, input: SessionResultInput) {
    // 1. Save session record to database
    const session = await AptitudeRepository.saveSession(userId, input);

    // 2. Update individual question progress records
    for (const res of input.results) {
      const status = res.isCorrect ? 'completed' : 'wrong';
      await AptitudeRepository.upsertProgress(userId, res.questionId, {
        status,
        answer: res.submittedAnswer,
        timeTaken: res.timeTaken,
      });
    }

    return session;
  }

  static async getDashboardStats(userId: string): Promise<AptitudeDashboardStats> {
    const allQuestions = AptitudeRepository.loadAllQuestions();
    const userProgress = await AptitudeRepository.getProgressForUser(userId);
    const sessions = await AptitudeRepository.getSessionsForUser(userId);

    // Calc basic progress counts
    const solvedQuestions = userProgress.filter((p) => p.status === 'completed');
    const solvedCount = solvedQuestions.length;

    // Difficulty distribution of completed questions
    const diffDistribution = { EASY: 0, MEDIUM: 0, HARD: 0 };
    for (const prog of solvedQuestions) {
      const q = allQuestions.find((ques) => ques.id === prog.questionId);
      if (q) {
        diffDistribution[q.difficulty]++;
      }
    }

    // Calculate accuracy and avg time
    let totalCorrect = 0;
    let totalAttempted = 0;
    let totalTimeTaken = 0;

    for (const sess of sessions) {
      totalCorrect += sess.score;
      totalAttempted += sess.questionCount;
      totalTimeTaken += sess.timeTaken;
    }

    const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
    const avgTimePerQuestion = totalAttempted > 0 ? Math.round(totalTimeTaken / totalAttempted) : 0;

    // Weekly activity heatmap (reusing [[0.1, 0.2, ...]] format for last 7 days)
    // We determine activity by scanning sessions and progress updates for the last 7 days.
    const now = new Date();
    const activityLevels = Array(7).fill(0);
    const oneDayMs = 24 * 60 * 60 * 1000;

    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(now.getTime() - (6 - i) * oneDayMs);
      const startOfDay = new Date(checkDate.setHours(0, 0, 0, 0)).getTime();
      const endOfDay = new Date(checkDate.setHours(23, 59, 59, 999)).getTime();

      // Count session activity
      const sessCount = sessions.filter((s) => {
        const t = new Date(s.completedAt).getTime();
        return t >= startOfDay && t <= endOfDay;
      }).length;

      // Count progress update activity
      const progCount = userProgress.filter((p) => {
        const t = new Date(p.updatedAt).getTime();
        return t >= startOfDay && t <= endOfDay;
      }).length;

      const totalAct = sessCount + progCount;
      activityLevels[i] = totalAct > 5 ? 1.0 : totalAct > 2 ? 0.6 : totalAct > 0 ? 0.3 : 0.0;
    }

    const weeklyActivity = [activityLevels];

    // Compute Streak
    let streak = 0;
    let checkDayOffset = 0;
    let activePrevious = true;

    while (activePrevious && checkDayOffset < 30) {
      const checkDate = new Date(now.getTime() - checkDayOffset * oneDayMs);
      const startOfDay = new Date(checkDate.setHours(0, 0, 0, 0)).getTime();
      const endOfDay = new Date(checkDate.setHours(23, 59, 59, 999)).getTime();

      const dayActivity = sessions.some((s) => {
        const t = new Date(s.completedAt).getTime();
        return t >= startOfDay && t <= endOfDay;
      }) || userProgress.some((p) => {
        const t = new Date(p.updatedAt).getTime();
        return t >= startOfDay && t <= endOfDay;
      });

      if (dayActivity) {
        streak++;
        checkDayOffset++;
      } else {
        // If it's today (offset 0) and we haven't done anything yet, keep checking yesterday.
        if (checkDayOffset === 0) {
          checkDayOffset++;
        } else {
          activePrevious = false;
        }
      }
    }

    // Calc topic wise progress detail & strength/weakness
    const topicProgress: TopicProgressDetail[] = [];
    const topicAccuracyMap: Record<string, { correct: number; total: number }> = {};

    // Group session details
    for (const sess of sessions) {
      const results = sess.results as any[];
      if (!Array.isArray(results)) continue;
      for (const res of results) {
        const q = allQuestions.find((ques) => ques.id === res.questionId);
        if (!q) continue;
        if (!topicAccuracyMap[q.topic]) {
          topicAccuracyMap[q.topic] = { correct: 0, total: 0 };
        }
        topicAccuracyMap[q.topic].total++;
        if (res.isCorrect) {
          topicAccuracyMap[q.topic].correct++;
        }
      }
    }

    // Build the stats list
    const categories: AptitudeCategory[] = ['quantitative', 'logical', 'verbal', 'di'];
    const solvedMap = new Set(solvedQuestions.map((p) => p.questionId));

    for (const category of categories) {
      for (const topic of APTITUDE_TOPICS_META[category]) {
        const topicQuestions = allQuestions.filter(
          (q) => q.topic === topic.id && q.category === category
        );
        const total = topicQuestions.length;
        if (total === 0) continue; // skip categories with 0 questions

        const solved = topicQuestions.filter((q) => solvedMap.has(q.id)).length;
        const accInfo = topicAccuracyMap[topic.id];
        const topicAcc = accInfo && accInfo.total > 0 ? Math.round((accInfo.correct / accInfo.total) * 100) : 0;

        topicProgress.push({
          topic: topic.id,
          name: topic.name,
          category,
          solved,
          total,
          accuracy: topicAcc,
        });
      }
    }

    // Sort into strong/weak
    const strongTopics: string[] = [];
    const weakTopics: string[] = [];

    for (const tp of topicProgress) {
      // If at least 3 attempts have been made in this topic, evaluate strength/weakness
      const accInfo = topicAccuracyMap[tp.topic];
      if (accInfo && accInfo.total >= 2) {
        const rate = (accInfo.correct / accInfo.total) * 100;
        if (rate >= 80) {
          strongTopics.push(tp.name);
        } else if (rate < 60) {
          weakTopics.push(tp.name);
        }
      }
    }

    // Default fallbacks if lists are empty
    if (strongTopics.length === 0 && solvedCount > 0) strongTopics.push('Percentages');
    if (weakTopics.length === 0 && solvedCount > 0) weakTopics.push('Time & Work');

    return {
      solvedCount,
      accuracy,
      avgTimePerQuestion,
      streak,
      totalSessions: sessions.length,
      weakTopics,
      strongTopics,
      topicProgress,
      difficultyDistribution: diffDistribution,
      weeklyActivity,
    };
  }
}
