// backend/src/features/aptitude/types.ts

export type AptitudeCategory = 'quantitative' | 'logical' | 'verbal' | 'di';

export interface AptitudeQuestion {
  id: string;
  title: string;
  description: string;
  options: string[];
  correctAnswer: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  difficultyLabel: string;
  explanation: string;
  topic: string;
  category: AptitudeCategory;
}

export interface CustomSessionOptions {
  topics: string[];
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'MIXED';
  questionCount: number;
  timeLimit: number; // in seconds, 0 for unlimited
  mode: 'practice' | 'test';
}

export interface QuestionResult {
  questionId: string;
  submittedAnswer: string;
  isCorrect: boolean;
  timeTaken: number; // in seconds
}

export interface SessionResultInput {
  mode: 'practice' | 'test';
  topics: string[];
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'MIXED';
  questionCount: number;
  timeLimit: number;
  score: number;
  accuracy: number;
  timeTaken: number;
  results: QuestionResult[];
}

export interface TopicProgressDetail {
  topic: string;
  name: string;
  category: AptitudeCategory;
  solved: number;
  total: number;
  accuracy: number;
}

export interface AptitudeDashboardStats {
  solvedCount: number;
  accuracy: number; // overall percentage (0-100)
  avgTimePerQuestion: number; // in seconds
  streak: number;
  totalSessions: number;
  weakTopics: string[];
  strongTopics: string[];
  topicProgress: TopicProgressDetail[];
  difficultyDistribution: {
    EASY: number;
    MEDIUM: number;
    HARD: number;
  };
  weeklyActivity: number[][]; // Reuses ActivityHeatmap format (7x7 grid or row of entries)
}
