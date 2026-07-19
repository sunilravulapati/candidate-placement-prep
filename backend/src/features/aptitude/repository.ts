// backend/src/features/aptitude/repository.ts

import prisma from '../../db/client';
import fs from 'fs';
import path from 'path';
import { AptitudeQuestion, SessionResultInput, AptitudeCategory } from './types';

// Map file names/slugs to human readable names
export const APTITUDE_TOPICS_META: Record<AptitudeCategory, { id: string; name: string; file?: string }[]> = {
  quantitative: [
    { id: 'percentages', name: 'Percentages', file: 'percentages.json' },
    { id: 'profit-loss', name: 'Profit & Loss', file: 'profit-loss.json' },
    { id: 'time-work', name: 'Time & Work', file: 'time-work.json' },
    { id: 'simple-interest', name: 'Simple Interest' },
    { id: 'compound-interest', name: 'Compound Interest' },
    { id: 'pipes-cisterns', name: 'Pipes & Cisterns' },
    { id: 'time-speed-distance', name: 'Time Speed Distance' },
    { id: 'ratio-proportion', name: 'Ratio & Proportion' },
    { id: 'partnership', name: 'Partnership' },
    { id: 'averages', name: 'Averages' },
    { id: 'mixtures', name: 'Mixtures' },
    { id: 'ages', name: 'Ages' },
    { id: 'number-system', name: 'Number System' },
    { id: 'hcf-lcm', name: 'HCF & LCM' },
    { id: 'probability', name: 'Probability' },
    { id: 'permutation-combination', name: 'Permutation & Combination' },
  ],
  logical: [
    { id: 'blood-relations', name: 'Blood Relations', file: 'blood-relations.json' },
    { id: 'puzzles', name: 'Puzzles', file: 'puzzles.json' },
    { id: 'coding-decoding', name: 'Coding Decoding' },
    { id: 'direction-sense', name: 'Direction Sense' },
    { id: 'seating-arrangement', name: 'Seating Arrangement' },
    { id: 'syllogisms', name: 'Syllogisms' },
    { id: 'statement-assumption', name: 'Statement & Assumption' },
    { id: 'statement-conclusion', name: 'Statement & Conclusion' },
    { id: 'data-sufficiency', name: 'Data Sufficiency' },
    { id: 'calendar', name: 'Calendar' },
    { id: 'clock', name: 'Clock' },
    { id: 'cubes', name: 'Cubes' },
    { id: 'series', name: 'Series' },
    { id: 'odd-one-out', name: 'Odd One Out' },
  ],
  verbal: [
    { id: 'vocabulary', name: 'Vocabulary', file: 'vocabulary.json' },
    { id: 'reading-comprehension', name: 'Reading Comprehension', file: 'reading-comprehension.json' },
    { id: 'synonyms', name: 'Synonyms' },
    { id: 'antonyms', name: 'Antonyms' },
    { id: 'fill-blanks', name: 'Fill in the Blanks' },
    { id: 'sentence-correction', name: 'Sentence Correction' },
    { id: 'para-jumbles', name: 'Para Jumbles' },
    { id: 'error-spotting', name: 'Error Spotting' },
    { id: 'idioms', name: 'Idioms' },
    { id: 'one-word-substitution', name: 'One Word Substitution' },
  ],
  di: [
    { id: 'pie-chart', name: 'Pie Charts', file: 'pie-chart.json' },
    { id: 'tables', name: 'Tables', file: 'tables.json' },
    { id: 'line-graphs', name: 'Line Graphs' },
    { id: 'bar-graphs', name: 'Bar Graphs' },
    { id: 'mixed-di', name: 'Mixed DI' },
  ],
};

export class AptitudeRepository {
  private static cachedQuestions: AptitudeQuestion[] | null = null;

  static loadAllQuestions(): AptitudeQuestion[] {
    if (this.cachedQuestions) return this.cachedQuestions;

    const dataDirCandidates = [
      path.join(process.cwd(), 'backend', 'data', 'aptitude'),
      path.join(process.cwd(), '..', 'backend', 'data', 'aptitude'),
      path.join(process.cwd(), 'helper', '..', 'backend', 'data', 'aptitude'),
    ];

    const dataDir = dataDirCandidates.find((candidate) => fs.existsSync(candidate));
    if (!dataDir) {
      console.warn('Aptitude questions data directory not found in candidates:', dataDirCandidates);
      return [];
    }

    const questions: AptitudeQuestion[] = [];

    // Scan each category directory
    const categories: AptitudeCategory[] = ['quantitative', 'logical', 'verbal', 'di'];
    for (const category of categories) {
      const categoryDir = path.join(dataDir, category);
      if (!fs.existsSync(categoryDir)) continue;

      const files = fs.readdirSync(categoryDir);
      for (const file of files) {
        if (!file.endsWith('.json')) continue;

        const filePath = path.join(categoryDir, file);
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          const fileQuestions = JSON.parse(content) as AptitudeQuestion[];
          
          // Double check category and topic tags
          const topicSlug = file.replace('.json', '');
          fileQuestions.forEach((q) => {
            q.category = category;
            q.topic = q.topic || topicSlug;
          });

          questions.push(...fileQuestions);
        } catch (error) {
          console.error(`Error reading or parsing aptitude file ${filePath}:`, error);
        }
      }
    }

    this.cachedQuestions = questions;
    return questions;
  }

  static clearCache() {
    this.cachedQuestions = null;
  }

  static getQuestions(filters?: {
    category?: AptitudeCategory;
    topic?: string;
    difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  }): AptitudeQuestion[] {
    let list = this.loadAllQuestions();

    if (filters?.category) {
      list = list.filter((q) => q.category === filters.category);
    }
    if (filters?.topic) {
      list = list.filter((q) => q.topic === filters.topic);
    }
    if (filters?.difficulty) {
      list = list.filter((q) => q.difficulty === filters.difficulty);
    }

    return list;
  }

  static getQuestionsByMultipleTopics(topics: string[], difficulty?: 'EASY' | 'MEDIUM' | 'HARD'): AptitudeQuestion[] {
    let list = this.loadAllQuestions();
    if (topics.length > 0) {
      list = list.filter((q) => topics.includes(q.topic));
    }
    if (difficulty) {
      list = list.filter((q) => q.difficulty === difficulty);
    }
    return list;
  }

  static findQuestionById(id: string): AptitudeQuestion | null {
    return this.loadAllQuestions().find((q) => q.id === id) || null;
  }

  // ── Database Interaction: User Progress ──────────────────────────────────────

  static async getProgressForUser(userId: string) {
    return prisma.userAptitudeProgress.findMany({
      where: { userId },
    });
  }

  static async upsertProgress(
    userId: string,
    questionId: string,
    data: {
      status?: string;
      answer?: string;
      isBookmarked?: boolean;
      notes?: string;
      timeTaken?: number;
    }
  ) {
    const question = this.findQuestionById(questionId);
    if (!question) {
      throw new Error(`Question with id ${questionId} not found in static bank.`);
    }

    return prisma.userAptitudeProgress.upsert({
      where: {
        userId_questionId: {
          userId,
          questionId,
        },
      },
      update: {
        status: data.status,
        answer: data.answer,
        isBookmarked: data.isBookmarked,
        notes: data.notes,
        timeTaken: data.timeTaken !== undefined ? { increment: data.timeTaken } : undefined,
      },
      create: {
        userId,
        questionId,
        category: question.category,
        topic: question.topic,
        status: data.status || 'not_started',
        answer: data.answer || null,
        isBookmarked: data.isBookmarked || false,
        notes: data.notes || '',
        timeTaken: data.timeTaken || 0,
      },
    });
  }

  // ── Database Interaction: Sessions ──────────────────────────────────────────

  static async saveSession(userId: string, input: SessionResultInput) {
    return prisma.aptitudeSession.create({
      data: {
        userId,
        mode: input.mode,
        topics: input.topics,
        difficulty: input.difficulty,
        questionCount: input.questionCount,
        timeLimit: input.timeLimit,
        score: input.score,
        accuracy: input.accuracy,
        timeTaken: input.timeTaken,
        results: input.results as any, // Cast result items JSON
      },
    });
  }

  static async getSessionsForUser(userId: string) {
    return prisma.aptitudeSession.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
    });
  }
}
