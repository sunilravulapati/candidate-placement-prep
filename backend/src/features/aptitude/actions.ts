// backend/src/features/aptitude/actions.ts
'use server';

import { getSessionUser } from '../../auth/session';
import { AptitudeService } from './service';
import { AptitudeRepository } from './repository';
import { CustomSessionOptions, SessionResultInput, AptitudeCategory } from './types';

export async function getAptitudeTopicsAction() {
  const user = await getSessionUser();
  return AptitudeService.getAptitudeTopics(user.id);
}

export async function getQuestionsForTopicAction(category: string, topic: string) {
  const user = await getSessionUser();
  const questions = AptitudeRepository.getQuestions({
    category: category as AptitudeCategory,
    topic,
  });

  // Pull existing progress for these questions to pre-fill notes/bookmarks
  const progressList = await AptitudeRepository.getProgressForUser(user.id);
  const progressMap = new Map(progressList.map((p) => [p.questionId, p]));

  return questions.map((q) => {
    const prog = progressMap.get(q.id);
    return {
      ...q,
      isBookmarked: prog?.isBookmarked || false,
      notes: prog?.notes || '',
      status: prog?.status || 'not_started',
      userAnswer: prog?.answer || null,
    };
  });
}

export async function createCustomSessionAction(options: CustomSessionOptions) {
  const user = await getSessionUser();
  const sessionData = await AptitudeService.createCustomSession(user.id, options);
  
  // Pull existing progress to pre-fill bookmarks/notes
  const progressList = await AptitudeRepository.getProgressForUser(user.id);
  const progressMap = new Map(progressList.map((p) => [p.questionId, p]));

  const questionsWithProgress = sessionData.questions.map((q) => {
    const prog = progressMap.get(q.id);
    return {
      ...q,
      isBookmarked: prog?.isBookmarked || false,
      notes: prog?.notes || '',
      status: prog?.status || 'not_started',
      userAnswer: prog?.answer || null,
    };
  });

  return {
    ...sessionData,
    questions: questionsWithProgress,
  };
}

export async function submitSessionResultsAction(input: SessionResultInput) {
  const user = await getSessionUser();
  return AptitudeService.submitSessionResults(user.id, input);
}

export async function upsertQuestionProgressAction(
  questionId: string,
  data: {
    status?: string;
    answer?: string;
    isBookmarked?: boolean;
    notes?: string;
    timeTaken?: number;
  }
) {
  const user = await getSessionUser();
  return AptitudeRepository.upsertProgress(user.id, questionId, data);
}

export async function getAptitudeDashboardStatsAction() {
  const user = await getSessionUser();
  return AptitudeService.getDashboardStats(user.id);
}

export async function getAptitudeHistoryAction() {
  const user = await getSessionUser();
  const sessions = await AptitudeRepository.getSessionsForUser(user.id);

  // Retrieve static questions to map title details to history items if needed
  const allQuestions = AptitudeRepository.loadAllQuestions();
  const questionMap = new Map(allQuestions.map((q) => [q.id, q]));

  return sessions.map((s) => {
    const results = (s.results as any[]) || [];
    const richResults = results.map((r) => {
      const q = questionMap.get(r.questionId);
      return {
        ...r,
        title: q?.title || 'Aptitude Question',
        options: q?.options || [],
        correctAnswer: q?.correctAnswer || '',
        explanation: q?.explanation || '',
        description: q?.description || '',
      };
    });

    return {
      id: s.id,
      mode: s.mode,
      topics: s.topics,
      difficulty: s.difficulty,
      questionCount: s.questionCount,
      timeLimit: s.timeLimit,
      score: s.score,
      accuracy: s.accuracy,
      timeTaken: s.timeTaken,
      completedAt: s.completedAt.toISOString(),
      results: richResults,
    };
  });
}
