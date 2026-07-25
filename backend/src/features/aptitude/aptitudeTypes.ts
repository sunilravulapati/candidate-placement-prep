// backend/src/features/aptitude/aptitudeTypes.ts

export type AptitudeCategory =
  | 'quantitative'
  | 'logical'
  | 'verbal'
  | 'programming'
  | 'sql'
  | 'python'
  | 'cs_fundamentals';

export type AptitudeDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface AptitudeOption {
  id: string; // e.g. "A", "B", "C", "D"
  text: string;
}

export interface AptitudeQuestionMetadata {
  id: string;
  category: AptitudeCategory;
  topic: string; // e.g. "percentages", "blood-relations", "time-work", "probability"
  subtopic?: string;
  difficulty: AptitudeDifficulty;
  companies: string[];
  learningPaths: string[];
  questionText: string;
  options: AptitudeOption[];
  answer: string; // Option ID e.g. "A" or exact string answer
  explanation: string;
  tags: string[];
  estimatedTimeSec: number;
}
