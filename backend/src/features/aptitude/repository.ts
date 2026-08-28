// backend/src/features/aptitude/repository.ts

import prisma from '../../db/client';
import fs from 'fs';
import path from 'path';
import { AptitudeQuestion, SessionResultInput, AptitudeCategory } from './types';

// Map file names/slugs to human readable names
export const APTITUDE_TOPICS_META: Record<AptitudeCategory, { id: string; name: string; file?: string }[]> = {
  quantitative: [
    { id: 'percentages', name: 'Percentages' },
    { id: 'profit-and-loss', name: 'Profit and Loss' },
    { id: 'time-and-work', name: 'Time and Work' },
    { id: 'speed-and-distance', name: 'Time, Speed and Distance' },
    { id: 'probability', name: 'Probability' },
    { id: 'permutation-and-combination', name: 'Permutation & Combination' },
    { id: 'hcf-and-lcm', name: 'HCF and LCM' },
    { id: 'ratio-and-proportion', name: 'Ratio and Proportion' },
    { id: 'simple-interest', name: 'Simple Interest' },
    { id: 'compound-interest', name: 'Compound Interest' },
    { id: 'pipes-and-cisterns', name: 'Pipes & Cisterns' },
    { id: 'averages', name: 'Averages' },
    { id: 'mixtures', name: 'Mixtures & Alligations' },
    { id: 'ages', name: 'Ages' },
    { id: 'number-systems', name: 'Number Systems' },
    { id: 'number-series', name: 'Number Series' },
    { id: 'algebra', name: 'Algebra' },
    { id: 'mensuration', name: 'Mensuration' },
    { id: 'logarithms', name: 'Logarithms' },
    { id: 'surds-and-indices', name: 'Surds and Indices' },
    { id: 'boats-and-streams', name: 'Boats and Streams' },
    { id: 'calendars', name: 'Calendars' },
    { id: 'clocks', name: 'Clocks' },
    { id: 'data-interpretation', name: 'Data Interpretation' },
    { id: 'aptitude', name: 'General Aptitude' },
  ],
  logical: [
    { id: 'analogies', name: 'Analogies' },
    { id: 'blood-relations', name: 'Blood Relations' },
    { id: 'coding-decoding', name: 'Coding-Decoding' },
    { id: 'direction-sense', name: 'Direction Sense' },
    { id: 'syllogisms', name: 'Syllogisms' },
    { id: 'seating-arrangement', name: 'Seating Arrangement' },
    { id: 'puzzles', name: 'Puzzles' },
    { id: 'series', name: 'Series' },
    { id: 'statement-and-assumptions', name: 'Statement & Assumptions' },
    { id: 'statement-and-conclusions', name: 'Statement & Conclusions' },
    { id: 'critical-reasoning', name: 'Critical Reasoning' },
    { id: 'cubes-and-dice', name: 'Cubes and Dice' },
    { id: 'data-sufficiency', name: 'Data Sufficiency' },
    { id: 'input-output', name: 'Input-Output' },
    { id: 'matrix-reasoning', name: 'Matrix Reasoning' },
    { id: 'venn-diagrams', name: 'Venn Diagrams' },
    { id: 'cause-and-effect', name: 'Cause and Effect' },
    { id: 'classification', name: 'Classification' },
    { id: 'logical', name: 'Logical Deduction' },
  ],
  verbal: [
    { id: 'vocabulary', name: 'Vocabulary' },
    { id: 'grammar', name: 'Grammar' },
    { id: 'error-spotting', name: 'Error Spotting' },
    { id: 'fill-in-the-blanks', name: 'Fill in the Blanks' },
    { id: 'para-jumbles', name: 'Para Jumbles' },
    { id: 'reading-comprehension', name: 'Reading Comprehension' },
    { id: 'sentence-improvement', name: 'Sentence Improvement' },
    { id: 'one-word-substitution', name: 'One Word Substitution' },
    { id: 'idioms-and-phrases', name: 'Idioms and Phrases' },
    { id: 'cloze-test', name: 'Cloze Test' },
    { id: 'word-analogy', name: 'Word Analogy' },
    { id: 'miscellaneous', name: 'Miscellaneous Verbal' },
  ],
  di: [
    { id: 'data-interpretation', name: 'Data Interpretation' },
  ],
};

export class AptitudeRepository {
  private static cachedQuestions: AptitudeQuestion[] | null = null;

  static loadAllQuestions(): AptitudeQuestion[] {
    if (this.cachedQuestions) return this.cachedQuestions;

    const dataDirCandidates = [
      path.join(process.cwd(), 'data', 'aptitude'),
      path.join(process.cwd(), 'backend', 'data', 'aptitude'),
      path.join(process.cwd(), '..', 'backend', 'data', 'aptitude'),
      path.join(process.cwd(), 'helper', '..', 'backend', 'data', 'aptitude'),
    ];

    const dataDir = dataDirCandidates.find((candidate) => fs.existsSync(candidate));
    if (!dataDir) {
      console.warn('Aptitude questions data directory not found in candidates:', dataDirCandidates);
      return [];
    }

    // Try fast loading from master index if present
    const masterIndex = path.join(dataDir, 'aptitude-index.json');
    if (fs.existsSync(masterIndex)) {
      try {
        const indexQuestions = JSON.parse(fs.readFileSync(masterIndex, 'utf-8')) as AptitudeQuestion[];
        this.cachedQuestions = indexQuestions;
        return indexQuestions;
      } catch (err) {
        console.warn('Failed loading aptitude master index, falling back to directory scan:', err);
      }
    }

    const questions: AptitudeQuestion[] = [];
    const categories: AptitudeCategory[] = ['quantitative', 'logical', 'verbal'];

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
          const topicSlug = file.replace('.json', '');

          fileQuestions.forEach((q) => {
            q.category = category;
            q.topic = q.topic || topicSlug;
          });

          questions.push(...fileQuestions);
        } catch (error) {
          console.error(`Error reading aptitude file ${filePath}:`, error);
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
    category?: AptitudeCategory | string;
    topic?: string;
    difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
    search?: string;
  }): AptitudeQuestion[] {
    let list = this.loadAllQuestions();

    if (filters?.category) {
      const cat = filters.category.toLowerCase();
      const normCat =
        cat === 'numerical ability' || cat === 'numerical-ability' || cat === 'quantitative'
          ? 'quantitative'
          : cat === 'verbal ability' || cat === 'verbal-ability' || cat === 'verbal'
          ? 'verbal'
          : 'logical';
      list = list.filter((q) => q.category === normCat);
    }

    if (filters?.topic) {
      const top = filters.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      list = list.filter((q) => q.topic === top || q.topic.toLowerCase() === filters.topic?.toLowerCase());
    }

    if (filters?.difficulty) {
      list = list.filter((q) => q.difficulty === filters.difficulty);
    }

    if (filters?.search) {
      const term = filters.search.toLowerCase().trim();
      list = list.filter(
        (q) =>
          q.title.toLowerCase().includes(term) ||
          q.description.toLowerCase().includes(term) ||
          (q as any).question?.toLowerCase().includes(term) ||
          q.topic.toLowerCase().includes(term)
      );
    }

    return list;
  }

  static getQuestionsByMultipleTopics(topics: string[], difficulty?: 'EASY' | 'MEDIUM' | 'HARD'): AptitudeQuestion[] {
    let list = this.loadAllQuestions();
    if (topics.length > 0) {
      const normTopics = topics.map((t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
      list = list.filter((q) => normTopics.includes(q.topic) || topics.includes(q.topic));
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
        results: input.results as any,
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
