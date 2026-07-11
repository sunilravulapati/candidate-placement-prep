export interface ExecutionRequest {
  code: string;
  language: string;
  input?: string; // Standard input for simple runs
  testCases?: { input: string; expectedOutput: string }[]; // For evaluating multiple cases
}

export interface ExecutionResult {
  passed: boolean;
  stdout: string;
  stderr: string;
  executionTimeMs: number;
  memoryBytes: number;
  errorType?: string;
  testCaseResults?: {
    passed: boolean;
    actualOutput: string;
    expectedOutput: string;
  }[];
}

export interface ExecutionProvider {
  /**
   * Run code with a single optional stdin.
   */
  runCode(request: ExecutionRequest): Promise<ExecutionResult>;
  
  /**
   * Run code against a suite of test cases.
   */
  runTestCases(request: ExecutionRequest): Promise<ExecutionResult>;
}
