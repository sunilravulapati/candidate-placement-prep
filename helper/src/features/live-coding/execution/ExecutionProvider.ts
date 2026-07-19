export type ExecutionErrorType =
  | 'COMPILE_ERROR'
  | 'RUNTIME_ERROR'
  | 'TIME_LIMIT_EXCEEDED'
  | 'MEMORY_LIMIT_EXCEEDED'
  | 'WRONG_ANSWER';

export interface ExecutionRequest {
  code: string;
  language: string;
  /** Standard input for simple single-run execution */
  input?: string;
  /** For evaluating multiple test cases in parallel */
  testCases?: { input: string; expectedOutput: string }[];
}

export interface TestCaseResult {
  passed: boolean;
  actualOutput: string;
  expectedOutput: string;
  input?: string;
  executionTimeMs?: number;
  memoryBytes?: number;
}

export interface ExecutionResult {
  /** True only when all test cases pass (or single run status is Accepted) */
  passed: boolean;
  /** Program stdout */
  stdout: string;
  /** Runtime / program stderr */
  stderr: string;
  /** Compiler output (separate from stderr) */
  compileOutput: string;
  executionTimeMs: number;
  memoryBytes: number;
  /** Typed error category for badge rendering */
  errorType?: ExecutionErrorType;
  /** Per-test-case breakdown (only populated by runTestCases) */
  testCaseResults?: TestCaseResult[];
}

export interface ExecutionProvider {
  /**
   * Execute code with a single optional stdin.
   * Used for the Submit flow.
   */
  runCode(request: ExecutionRequest): Promise<ExecutionResult>;

  /**
   * Execute code against a suite of test cases.
   * Used for the Run (sample tests) flow.
   */
  runTestCases(request: ExecutionRequest): Promise<ExecutionResult>;
}
