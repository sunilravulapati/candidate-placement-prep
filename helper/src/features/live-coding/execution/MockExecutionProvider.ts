import type {
  ExecutionErrorType,
  ExecutionProvider,
  ExecutionRequest,
  ExecutionResult,
} from './ExecutionProvider';

/**
 * Deterministic mock provider — simulates all error types via code comments.
 * Used when NEXT_PUBLIC_JUDGE0_API_KEY is not configured.
 *
 * Trigger keywords (case-insensitive):
 *   // compile error   → COMPILE_ERROR
 *   // tle             → TIME_LIMIT_EXCEEDED
 *   // mle             → MEMORY_LIMIT_EXCEEDED
 *   // runtime error   → RUNTIME_ERROR
 *   // wrong           → WRONG_ANSWER
 *   (anything else)    → ACCEPTED
 */
export class MockExecutionProvider implements ExecutionProvider {
  async runCode(request: ExecutionRequest): Promise<ExecutionResult> {
    await delay(800);
    return this.simulateSingle(request.code);
  }

  async runTestCases(request: ExecutionRequest): Promise<ExecutionResult> {
    await delay(1200);
    const code = request.code.toLowerCase();
    const testCases = request.testCases ?? [];
    const errorType = detectError(code);

    if (errorType === 'COMPILE_ERROR') {
      return makeCompileError(testCases);
    }
    if (errorType === 'TIME_LIMIT_EXCEEDED') {
      return makeTLE(testCases);
    }
    if (errorType === 'MEMORY_LIMIT_EXCEEDED') {
      return makeMLE(testCases);
    }
    if (errorType === 'RUNTIME_ERROR') {
      return makeRuntimeError(testCases);
    }

    const isWrong = errorType === 'WRONG_ANSWER';
    const caseResults = testCases.map((tc, idx) => {
      const fail = isWrong && (idx === 1 || (idx === 0 && testCases.length === 1));
      return {
        passed: !fail,
        actualOutput: fail ? 'Wrong Output' : tc.expectedOutput,
        expectedOutput: tc.expectedOutput,
        input: tc.input,
        executionTimeMs: 18 + idx * 4,
        memoryBytes: 12 * 1024 * 1024,
      };
    });

    const allPassed = caseResults.every((r) => r.passed);
    return {
      passed: allPassed,
      stdout: allPassed ? caseResults.map((r) => r.actualOutput).join('\n') : '',
      stderr: allPassed ? '' : 'Wrong Answer on test case 2',
      compileOutput: '',
      executionTimeMs: caseResults.reduce((s, r) => s + r.executionTimeMs, 0),
      memoryBytes: 12 * 1024 * 1024,
      errorType: allPassed ? undefined : 'WRONG_ANSWER',
      testCaseResults: caseResults,
    };
  }

  private simulateSingle(code: string): ExecutionResult {
    const lower = code.toLowerCase();
    const errorType = detectError(lower);

    if (errorType === 'COMPILE_ERROR') {
      return {
        passed: false,
        stdout: '',
        stderr: '',
        compileOutput: "error: expected ';' before '}' token\n  10 | }\n     | ^",
        executionTimeMs: 0,
        memoryBytes: 0,
        errorType: 'COMPILE_ERROR',
      };
    }
    if (errorType === 'TIME_LIMIT_EXCEEDED') {
      return {
        passed: false,
        stdout: '',
        stderr: 'Time limit exceeded after 5000 ms',
        compileOutput: '',
        executionTimeMs: 5000,
        memoryBytes: 15 * 1024 * 1024,
        errorType: 'TIME_LIMIT_EXCEEDED',
      };
    }
    if (errorType === 'MEMORY_LIMIT_EXCEEDED') {
      return {
        passed: false,
        stdout: '',
        stderr: 'Memory limit exceeded (256 MB)',
        compileOutput: '',
        executionTimeMs: 45,
        memoryBytes: 256 * 1024 * 1024,
        errorType: 'MEMORY_LIMIT_EXCEEDED',
      };
    }
    if (errorType === 'RUNTIME_ERROR') {
      return {
        passed: false,
        stdout: '',
        stderr: 'Runtime Error: index out of range (index 5, size 3)',
        compileOutput: '',
        executionTimeMs: 12,
        memoryBytes: 12 * 1024 * 1024,
        errorType: 'RUNTIME_ERROR',
      };
    }
    if (errorType === 'WRONG_ANSWER') {
      return {
        passed: false,
        stdout: 'Wrong Output\n',
        stderr: '',
        compileOutput: '',
        executionTimeMs: 45,
        memoryBytes: 12 * 1024 * 1024,
        errorType: 'WRONG_ANSWER',
      };
    }

    return {
      passed: true,
      stdout: 'Accepted\n',
      stderr: '',
      compileOutput: '',
      executionTimeMs: 45,
      memoryBytes: 12 * 1024 * 1024,
    };
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function detectError(lower: string): ExecutionErrorType | null {
  if (lower.includes('// compile error')) return 'COMPILE_ERROR';
  if (lower.includes('// tle')) return 'TIME_LIMIT_EXCEEDED';
  if (lower.includes('// mle')) return 'MEMORY_LIMIT_EXCEEDED';
  if (lower.includes('// runtime error')) return 'RUNTIME_ERROR';
  if (lower.includes('// wrong')) return 'WRONG_ANSWER';
  return null;
}

type TC = { input: string; expectedOutput: string };

function makeCompileError(testCases: TC[]): ExecutionResult {
  return {
    passed: false,
    stdout: '',
    stderr: '',
    compileOutput: "error: expected ';' before '}' token\n  10 | }\n     | ^",
    executionTimeMs: 0,
    memoryBytes: 0,
    errorType: 'COMPILE_ERROR',
    testCaseResults: testCases.map((tc) => ({
      passed: false,
      actualOutput: '',
      expectedOutput: tc.expectedOutput,
      input: tc.input,
    })),
  };
}

function makeTLE(testCases: TC[]): ExecutionResult {
  return {
    passed: false,
    stdout: '',
    stderr: 'Time Limit Exceeded after 5000 ms',
    compileOutput: '',
    executionTimeMs: 5000,
    memoryBytes: 15 * 1024 * 1024,
    errorType: 'TIME_LIMIT_EXCEEDED',
    testCaseResults: testCases.map((tc) => ({
      passed: false,
      actualOutput: '',
      expectedOutput: tc.expectedOutput,
      input: tc.input,
    })),
  };
}

function makeMLE(testCases: TC[]): ExecutionResult {
  return {
    passed: false,
    stdout: '',
    stderr: 'Memory Limit Exceeded (256 MB)',
    compileOutput: '',
    executionTimeMs: 45,
    memoryBytes: 256 * 1024 * 1024,
    errorType: 'MEMORY_LIMIT_EXCEEDED',
    testCaseResults: testCases.map((tc) => ({
      passed: false,
      actualOutput: '',
      expectedOutput: tc.expectedOutput,
      input: tc.input,
    })),
  };
}

function makeRuntimeError(testCases: TC[]): ExecutionResult {
  return {
    passed: false,
    stdout: '',
    stderr: 'Runtime Error: index out of range (index 5, size 3)',
    compileOutput: '',
    executionTimeMs: 12,
    memoryBytes: 12 * 1024 * 1024,
    errorType: 'RUNTIME_ERROR',
    testCaseResults: testCases.map((tc) => ({
      passed: false,
      actualOutput: '',
      expectedOutput: tc.expectedOutput,
      input: tc.input,
    })),
  };
}
