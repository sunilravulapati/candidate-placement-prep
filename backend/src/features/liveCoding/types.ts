export type CodingDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export type ProblemStatus = 'SOLVED' | 'ATTEMPTED' | 'BOOKMARKED' | 'NOT_STARTED';

export type SortOption =
  | 'newest'
  | 'oldest'
  | 'acceptance'
  | 'difficulty'
  | 'alphabetical'
  | 'most-solved'
  | 'least-solved'
  | 'company-frequency';

export type SupportedLanguage = 'cpp' | 'python' | 'java' | 'javascript' | 'typescript';

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['cpp', 'python', 'java', 'javascript', 'typescript'];

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  cpp: 'C++',
  python: 'Python',
  java: 'Java',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
};

export const MONACO_LANGUAGE_MAP: Record<SupportedLanguage, string> = {
  cpp: 'cpp',
  python: 'python',
  java: 'java',
  javascript: 'javascript',
  typescript: 'typescript',
};

export const TOPIC_FILTER_MAP: Record<string, string[]> = {
  arrays: ['arrays-strings', 'arrays'],
  strings: ['arrays-strings', 'strings'],
  hashing: ['hashing', 'hash-table'],
  'two-pointers': ['two-pointers'],
  'sliding-window': ['sliding-window'],
  'binary-search': ['binary-search', 'searching-sorting'],
  'linked-list': ['linked-lists', 'linked-list'],
  stack: ['stacks-queues', 'stack'],
  queue: ['stacks-queues', 'queue'],
  tree: ['trees', 'tree', 'bst', 'bst-binary-search-tree'],
  graph: ['graphs', 'graph'],
  dp: ['dynamic-programming', 'dp-dynamic-programming'],
  greedy: ['greedy'],
  backtracking: ['recursion-backtracking', 'backtracking'],
  recursion: ['recursion', 'recursion-backtracking'],
  searching: ['searching-sorting', 'searching', 'binary-search'],
  sorting: ['searching-sorting', 'sorting'],
  'bit-manipulation': ['bit-manipulation'],
  heap: ['heap', 'priority-queue'],
  trie: ['trie'],
};

export const COMPANY_SLUGS = [
  'amazon',
  'google',
  'microsoft',
  'adobe',
  'flipkart',
  'cisco',
  'jpmc',
  'goldman-sachs',
] as const;

export interface ProblemFilters {
  search?: string;
  difficulty?: CodingDifficulty;
  topic?: string;
  company?: string;
  status?: ProblemStatus;
  bookmarked?: boolean;
  limit?: number;
  offset?: number;
  sort?: SortOption;
  userId?: string;
}

export interface TestCase {
  input: string;
  displayInput?: string;
  expectedOutput: string;
}

export interface WorkspaceProblem {
  questionNo?: number;
  slug: string;
  title: string;
  difficulty: CodingDifficulty;
  importance?: string;
  interviewFrequency?: string;
  estimatedSolveTime?: string;
  description: string;
  whyLearnThis?: string;
  recognitionClues?: string;
  prerequisites?: string;
  concepts?: string;
  keywords?: string[];
  primaryTopic?: string;
  secondaryTopics?: string[];
  pattern?: string;
  patternId?: string;
  technique?: string;
  techniqueId?: string;
  dataStructuresUsed?: string[];
  learningPath?: string;
  constraints: string[];
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  starterCode: Record<string, string>;
  starterMetadata?: any;
  executionMetadata?: any;
  driverMetadata?: any;
  editorial?: string | null;
  hints: string[];

  // Complexity Matrix
  optimalTC?: string;
  optimalSC?: string;
  bruteTC?: string;
  bruteSC?: string;

  // Pedagogical Solution & Notes
  approach?: string;
  intuition?: string;
  algorithm?: string;
  pseudocode?: string;
  commonMistakes?: string[];
  edgeCases?: string[];
  interviewTrick?: string;
  revisionNotes?: string;

  // Relationships & Resources
  followUps?: string[];
  variants?: string[];
  relatedProblems?: string[];
  resources?: Array<{ type: string; url: string }>;
  inputTemplates?: Record<string, string>;
  referenceSolutions?: Record<string, string>;
  inputHelper?: {
    inputFormat?: string;
    sampleInput?: string;
    codeTemplates?: Record<string, string>;
  };

  /** Visible sample test cases — shown in Test Cases tab */
  sampleTests: TestCase[];
  /** Hidden test cases — used only during Submit, never shown to user */
  hiddenTests: TestCase[];
  companies: Array<{
    name: string;
    slug: string;
  }>;
  topics: Array<{
    name: string;
    slug: string;
  }>;
  tags: Array<{
    name: string;
    slug: string;
  }>;
  expectedApproach?: string | null;
  timeComplexity?: string | null;
  spaceComplexity?: string | null;
  estimatedTime: number;
  status?: ProblemStatus;
  isBookmarked?: boolean;
  isSolved?: boolean;
}


export interface BasicReview {
  timeComplexity: string;
  spaceComplexity: string;
  summary: string;
  isAccepted: boolean;
}

export interface DetailedReview {
  correctnessReview: string;
  edgeCasesMissed: string[];
  alternativeSolution: string;
  optimizationSuggestions: string[];
  interviewerFeedback: string;
  codeStyleReview: string;
  companyReadiness: Record<string, number>;
  overallRating: number;
}

export interface ExecutionTestResult {
  passed: boolean;
  actualOutput: string;
  expectedOutput: string;
  input?: string;
  hidden?: boolean;
}

export interface MockExecutionOutput {
  status: 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'MEMORY_LIMIT_EXCEEDED' | 'COMPILE_ERROR' | 'RUNTIME_ERROR';
  passedCount: number;
  totalCount: number;
  executionTimeMs: number;
  memoryBytes: number;
  stdout: string;
  stderr: string;
  testCaseResults: ExecutionTestResult[];
  basicReview: BasicReview;
}

export interface SubmissionRecord {
  problemSlug: string;
  language: string;
  status: MockExecutionOutput['status'];
  passedCount: number;
  totalCount: number;
  executionTimeMs: number;
  memoryBytes: number;
  codeSnapshot: string;
  sessionId?: string;
}

export interface DashboardData {
  stats: {
    easy: { solved: number; total: number };
    medium: { solved: number; total: number };
    hard: { solved: number; total: number };
    acceptanceRate: number;
    solvedToday: number;
    currentStreak: number;
    longestStreak: number;
  };
  todaysChallenge: {
    slug: string;
    title: string;
    difficulty: string;
    topics: string[];
    companies: string[];
  } | null;
  continueSession: {
    sessionId: string;
    slug: string;
    title: string;
    difficulty: string;
    language: string;
    lastActive: string;
  } | null;
  recentAttempts: Array<{
    id: string;
    slug: string;
    title: string;
    difficulty: string;
    status: string;
    time: string;
    language: string;
  }>;
  bookmarks: Array<{
    slug: string;
    title: string;
    difficulty: string;
  }>;
  learningPaths: Array<{
    slug: string;
    title: string;
    progress: number;
    total: number;
    solved: number;
  }>;
  companyProgress: Array<{
    name: string;
    slug: string;
    solved: number;
    total: number;
  }>;
  topicProgress: Array<{
    name: string;
    slug: string;
    solved: number;
    total: number;
  }>;
  heatmap: number[][];
}
