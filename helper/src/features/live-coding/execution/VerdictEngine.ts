import type {
  ExecutionErrorType,
  ExecutionResult,
  TestCaseResult,
} from './ExecutionProvider';

export interface RawExecutionOutput {
  stdout: string;
  stderr: string;
  compileOutput?: string;
  executionTimeMs?: number;
  memoryBytes?: number;
  exitCode?: number;
  signal?: string | null;
  timedOut?: boolean;
  isCompileError?: boolean;
}

export class VerdictEngine {
  /**
   * Evaluate a single code execution against an optional expected output.
   */
  static evaluateSingle(
    raw: RawExecutionOutput,
    expectedOutput?: string
  ): ExecutionResult {
    const stdout = raw.stdout ?? '';
    const stderr = raw.stderr ?? '';
    const compileOutput = raw.compileOutput ?? '';
    const timeMs = raw.executionTimeMs ?? 0;
    const memBytes = raw.memoryBytes ?? 0;

    // 1. Compilation Error
    if (raw.isCompileError || (compileOutput.trim().length > 0 && raw.exitCode !== 0 && !stdout)) {
      return {
        passed: false,
        stdout: '',
        stderr: stderr,
        compileOutput: compileOutput || stderr || 'Compilation Error',
        executionTimeMs: 0,
        memoryBytes: 0,
        errorType: 'COMPILE_ERROR',
      };
    }

    // 2. Time Limit Exceeded
    if (raw.timedOut || raw.signal === 'SIGKILL' || raw.signal === 'SIGXCPU') {
      return {
        passed: false,
        stdout: stdout,
        stderr: stderr || 'Time Limit Exceeded',
        compileOutput: '',
        executionTimeMs: Math.max(timeMs, 2000),
        memoryBytes: memBytes,
        errorType: 'TIME_LIMIT_EXCEEDED',
      };
    }

    // 3. Runtime Error (strictly check non-zero process exit code)
    if (raw.exitCode !== undefined && raw.exitCode !== 0) {
      return {
        passed: false,
        stdout: stdout,
        stderr: stderr || `Process exited with code ${raw.exitCode}`,
        compileOutput: compileOutput,
        executionTimeMs: timeMs,
        memoryBytes: memBytes,
        errorType: 'RUNTIME_ERROR',
      };
    }

    // 4. Output evaluation if expected output is provided
    let passed = true;
    let errorType: ExecutionErrorType | undefined = undefined;

    if (expectedOutput !== undefined) {
      const actualNormalized = stdout.trim();
      const expectedNormalized = expectedOutput.trim();

      if (actualNormalized !== expectedNormalized) {
        passed = false;
        errorType = 'WRONG_ANSWER';
      }
    }

    return {
      passed,
      stdout,
      stderr,
      compileOutput,
      executionTimeMs: timeMs,
      memoryBytes: memBytes,
      errorType,
    };
  }

  /**
   * Evaluate multi-testcase raw execution outputs.
   */
  static evaluateTestCases(
    testCases: { input: string; expectedOutput: string }[],
    rawOutputs: RawExecutionOutput[]
  ): ExecutionResult {
    // 1. Check for compilation failure on any case
    const compileFailure = rawOutputs.find(
      (r) => r.isCompileError || (r.compileOutput && r.compileOutput.trim().length > 0 && r.exitCode !== 0 && !r.stdout)
    );

    if (compileFailure) {
      return {
        passed: false,
        stdout: '',
        stderr: compileFailure.stderr ?? '',
        compileOutput: compileFailure.compileOutput || compileFailure.stderr || 'Compilation Error',
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

    // 2. Evaluate individual test cases
    const caseResults: TestCaseResult[] = [];
    let firstErrorType: ExecutionErrorType | undefined = undefined;
    let combinedStderr = '';
    let totalTimeMs = 0;
    let maxMemoryBytes = 0;

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const raw = rawOutputs[i] ?? { stdout: '', stderr: '', executionTimeMs: 0, memoryBytes: 0 };
      const singleRes = this.evaluateSingle(raw, tc.expectedOutput);

      totalTimeMs += singleRes.executionTimeMs;
      maxMemoryBytes = Math.max(maxMemoryBytes, singleRes.memoryBytes);

      if (!singleRes.passed && !firstErrorType) {
        firstErrorType = singleRes.errorType ?? 'WRONG_ANSWER';
        combinedStderr = singleRes.stderr;
      }

      caseResults.push({
        passed: singleRes.passed,
        actualOutput: singleRes.stdout.trim(),
        expectedOutput: tc.expectedOutput.trim(),
        input: tc.input,
        executionTimeMs: singleRes.executionTimeMs,
        memoryBytes: singleRes.memoryBytes,
      });
    }

    const allPassed = caseResults.every((c) => c.passed);

    return {
      passed: allPassed,
      stdout: caseResults.map((c) => c.actualOutput).join('\n').trim(),
      stderr: combinedStderr,
      compileOutput: '',
      executionTimeMs: totalTimeMs,
      memoryBytes: maxMemoryBytes,
      errorType: allPassed ? undefined : (firstErrorType ?? 'WRONG_ANSWER'),
      testCaseResults: caseResults,
    };
  }
}
