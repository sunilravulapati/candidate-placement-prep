// backend/src/features/dsa/types.ts

export interface QuestionFilter {
  category?: string;
  difficulty?: string;
  status?: string;
  userId?: string;
}

export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type ProgressStatus = 'not_started' | 'in_progress' | 'completed';

export interface QuestionProgressUpdateInput {
  status?: ProgressStatus;
  code?: string;
  notes?: string;
  isRevision?: boolean;
}
