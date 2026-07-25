// backend/src/features/dsa/dsaTypes.ts

import { StarterMetadata, ExecutionMetadata, DriverMetadata } from './canonicalTypes';

export type DSADifficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type ReviewStatus = 'draft' | 'reviewed' | 'verified' | 'published';

export interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export type TestClassification = 'sample' | 'edge' | 'corner' | 'stress' | 'performance' | 'hidden';

export interface TestCaseSpec {
  id?: string;
  classification?: TestClassification;
  input: string;
  displayInput?: string;
  expectedOutput: string;
  explanation?: string;
}

export interface ResourceLink {
  type: string; // 'leetcode' | 'gfg' | 'neetcode' | 'striver' | string
  url: string;
}

export interface SolutionMetadata {
  optimalComplexity?: {
    time: string;
    space: string;
  };
  bruteComplexity?: {
    time: string;
    space: string;
  };
  alternativeApproaches?: Array<{
    name?: string;
    description?: string;
    time?: string;
    space?: string;
  }>;
  patterns?: string[];
  commonMistakes?: string[];
  edgeCases?: string[];
  interviewNotes?: string[];
  interviewTrick?: string;
  revisionNotes?: string;
  approach?: string;
  intuition?: string;
  algorithm?: string;
  pseudocode?: string;
  optimalCode?: Record<string, string>;
  supportedLanguages?: string[];
  referenceLanguage?: string;
  lastVerified?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  explanation?: string;
  dryRun?: string;
  videoUrl?: string;
}

export interface AIMetadata {
  patterns?: string[];
  commonMistakes?: string[];
  hints?: string[];
  dryRunExample?: string;
  edgeCases?: string[];
  patternNotes?: string;
}

export interface ProblemRelationships {
  prerequisites?: string[];
  followUps?: string[];
  variants?: string[];
  related?: string[];
  learningPathPrevious?: string | null;
  learningPathNext?: string | null;
  nextProblems?: string[];
  learningPathStep?: {
    path: string;
    step: number;
  };
  companyFrequency?: Record<string, number>;
}

export interface AnalyticsMetadata {
  acceptanceRate?: number;
  frequency?: number;
  avgSolveTimeMinutes?: number;
  totalSubmissions?: number;
  totalAccepted?: number;
}

export interface DSAProblemMetadata {
  id?: string;
  schemaVersion?: string | number; // e.g. "2.0"
  contentVersion?: string | number; // e.g. "1.1"
  metadataVersion?: string | number;
  importVersion?: string; // e.g. "54-column-sheet"
  lastReviewed?: string;
  lastModified?: string;
  author?: string;
  reviewStatus?: ReviewStatus;
  
  questionNo?: number;
  slug: string;
  title: string;
  difficulty: DSADifficulty;
  importance?: string; // e.g. "4/5"
  interviewFrequency?: string; // e.g. "High"
  estimatedSolveTime?: string; // e.g. "25 mins"
  leetcodeNumber?: number;
  estimatedMinutes?: number;
  frequency?: number;
  acceptanceRate?: number;
  premium?: boolean;

  // Categorization & Registries
  topic: string; // Primary topic slug
  topicId?: string;
  primaryTopic?: string;
  secondaryTopics?: string[]; // Multiple topic support
  pattern?: string;
  patternId?: string;
  technique?: string;
  techniqueId?: string;
  dataStructuresUsed?: string[];
  learningPath?: string;
  learningPaths: string[];
  subtopic?: string;

  // Learning & Pedagogical
  description: string;
  whyLearnThis?: string;
  recognitionClues?: string;
  prerequisites?: string;
  concepts?: string;
  keywords?: string[];
  tags: string[];
  companies: string[];
  constraints: string[];
  examples: ProblemExample[];
  hints: string[];

  // Complexity & Specs
  optimalTC?: string;
  optimalSC?: string;
  bruteTC?: string;
  bruteSC?: string;

  // Detailed Solution & Pedagogical Content
  approach?: string;
  intuition?: string;
  algorithm?: string;
  pseudocode?: string;
  commonMistakes?: string[];
  edgeCases?: string[];
  interviewTrick?: string;
  revisionNotes?: string;

  // Resources & External Links
  resources?: ResourceLink[];
  inputTemplates?: Record<string, string>;

  editorial?: string;
  starterMetadata: StarterMetadata;
  executionMetadata: ExecutionMetadata;
  driverMetadata?: DriverMetadata;
  relationships?: ProblemRelationships;
  visibleTests: TestCaseSpec[];
  hiddenTests: TestCaseSpec[];
  tests?: TestCaseSpec[];
  solutionMetadata?: SolutionMetadata;
  aiMetadata?: AIMetadata;
  analyticsMetadata?: AnalyticsMetadata;
  createdAt?: string;
  updatedAt?: string;
}



