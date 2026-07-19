import type { BasicReview, ExecutionTestResult, MockExecutionOutput, TestCase } from './types';

const DEFAULT_STARTER_TEMPLATES: Record<string, string> = {
  cpp: `class Solution {
public:
    
};`,
  python: `class Solution:
    def solve(self):
        pass`,
  java: `class Solution {
    
}`,
  javascript: `/**
 * @return {void}
 */
var solve = function() {
    
};`,
};

export function getStarterCode(
  starterCode: Record<string, string> | null | undefined,
  language: string,
  title?: string
): string {
  const code = starterCode?.[language];
  if (code) return code;
  return DEFAULT_STARTER_TEMPLATES[language] ?? `// ${title ?? 'Solution'}\n`;
}

function detectErrorType(code: string): MockExecutionOutput['status'] | null {
  const lower = code.toLowerCase();
  if (lower.includes('// compile error')) return 'COMPILE_ERROR';
  if (lower.includes('// tle')) return 'TIME_LIMIT_EXCEEDED';
  if (lower.includes('// mle')) return 'MEMORY_LIMIT_EXCEEDED';
  if (lower.includes('// runtime error')) return 'RUNTIME_ERROR';
  if (lower.includes('// wrong')) return 'WRONG_ANSWER';
  return null;
}

function deterministicMetrics(code: string, testCount: number): { executionTimeMs: number; memoryBytes: number } {
  const hash = code.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return {
    executionTimeMs: 12 + (hash % 40) + testCount * 3,
    memoryBytes: (18 + (hash % 12)) * 1024 * 1024,
  };
}

function buildBasicReview(
  status: MockExecutionOutput['status'],
  timeComplexity?: string | null,
  spaceComplexity?: string | null
): BasicReview {
  const isAccepted = status === 'ACCEPTED';
  return {
    timeComplexity: timeComplexity ?? 'O(n)',
    spaceComplexity: spaceComplexity ?? 'O(1)',
    summary: isAccepted
      ? 'Your solution passes all test cases.'
      : status === 'COMPILE_ERROR'
        ? 'Your code failed to compile.'
        : status === 'TIME_LIMIT_EXCEEDED'
          ? 'Your solution exceeded the time limit.'
          : status === 'MEMORY_LIMIT_EXCEEDED'
            ? 'Your solution exceeded the memory limit.'
            : status === 'RUNTIME_ERROR'
              ? 'Your solution encountered a runtime error.'
              : 'Your solution failed one or more test cases.',
    isAccepted,
  };
}

export function runSampleTests(
  code: string,
  sampleTests: TestCase[],
  timeComplexity?: string | null,
  spaceComplexity?: string | null
): MockExecutionOutput {
  const errorType = detectErrorType(code);
  const metrics = deterministicMetrics(code, sampleTests.length);

  if (errorType === 'COMPILE_ERROR') {
    return {
      status: 'COMPILE_ERROR',
      passedCount: 0,
      totalCount: sampleTests.length,
      executionTimeMs: 0,
      memoryBytes: 0,
      stdout: '',
      stderr: 'Compilation Error: syntax error near token',
      testCaseResults: sampleTests.map((tc) => ({
        passed: false,
        actualOutput: '',
        expectedOutput: tc.expectedOutput,
        input: tc.input,
        hidden: false,
      })),
      basicReview: buildBasicReview('COMPILE_ERROR', timeComplexity, spaceComplexity),
    };
  }

  if (errorType === 'TIME_LIMIT_EXCEEDED') {
    return {
      status: 'TIME_LIMIT_EXCEEDED',
      passedCount: 0,
      totalCount: sampleTests.length,
      executionTimeMs: 5000,
      memoryBytes: metrics.memoryBytes,
      stdout: '',
      stderr: 'Time Limit Exceeded',
      testCaseResults: sampleTests.map((tc) => ({
        passed: false,
        actualOutput: '',
        expectedOutput: tc.expectedOutput,
        input: tc.input,
        hidden: false,
      })),
      basicReview: buildBasicReview('TIME_LIMIT_EXCEEDED', timeComplexity, spaceComplexity),
    };
  }

  if (errorType === 'MEMORY_LIMIT_EXCEEDED') {
    return {
      status: 'MEMORY_LIMIT_EXCEEDED',
      passedCount: 0,
      totalCount: sampleTests.length,
      executionTimeMs: metrics.executionTimeMs,
      memoryBytes: 256 * 1024 * 1024,
      stdout: '',
      stderr: 'Memory Limit Exceeded',
      testCaseResults: sampleTests.map((tc) => ({
        passed: false,
        actualOutput: '',
        expectedOutput: tc.expectedOutput,
        input: tc.input,
        hidden: false,
      })),
      basicReview: buildBasicReview('MEMORY_LIMIT_EXCEEDED', timeComplexity, spaceComplexity),
    };
  }

  if (errorType === 'RUNTIME_ERROR') {
    return {
      status: 'RUNTIME_ERROR',
      passedCount: 0,
      totalCount: sampleTests.length,
      executionTimeMs: metrics.executionTimeMs,
      memoryBytes: metrics.memoryBytes,
      stdout: '',
      stderr: 'Runtime Error: index out of bounds',
      testCaseResults: sampleTests.map((tc) => ({
        passed: false,
        actualOutput: '',
        expectedOutput: tc.expectedOutput,
        input: tc.input,
        hidden: false,
      })),
      basicReview: buildBasicReview('RUNTIME_ERROR', timeComplexity, spaceComplexity),
    };
  }

  const isWrong = errorType === 'WRONG_ANSWER';
  const results: ExecutionTestResult[] = sampleTests.map((tc, index) => {
    const failThis = isWrong && (index === 1 || (index === 0 && sampleTests.length === 1));
    return {
      passed: !failThis,
      actualOutput: failThis ? 'Wrong Output' : tc.expectedOutput,
      expectedOutput: tc.expectedOutput,
      input: tc.input,
      hidden: false,
    };
  });

  const passedCount = results.filter((r) => r.passed).length;
  const allPassed = passedCount === sampleTests.length;

  return {
    status: allPassed ? 'ACCEPTED' : 'WRONG_ANSWER',
    passedCount,
    totalCount: sampleTests.length,
    executionTimeMs: metrics.executionTimeMs,
    memoryBytes: metrics.memoryBytes,
    stdout: allPassed ? results.map((r) => r.actualOutput).join('\n') : '',
    stderr: allPassed ? '' : 'Wrong Answer',
    testCaseResults: results,
    basicReview: buildBasicReview(allPassed ? 'ACCEPTED' : 'WRONG_ANSWER', timeComplexity, spaceComplexity),
  };
}

export function submitSolution(
  code: string,
  sampleTests: TestCase[],
  hiddenTests: TestCase[],
  timeComplexity?: string | null,
  spaceComplexity?: string | null
): MockExecutionOutput {
  const allTests = [
    ...sampleTests.map((tc) => ({ ...tc, hidden: false })),
    ...hiddenTests.map((tc) => ({ ...tc, hidden: true })),
  ];

  const errorType = detectErrorType(code);
  const metrics = deterministicMetrics(code, allTests.length);

  if (errorType === 'COMPILE_ERROR') {
    return {
      status: 'COMPILE_ERROR',
      passedCount: 0,
      totalCount: allTests.length,
      executionTimeMs: 0,
      memoryBytes: 0,
      stdout: '',
      stderr: 'Compilation Error: syntax error near token',
      testCaseResults: allTests.map((tc) => ({
        passed: false,
        actualOutput: '',
        expectedOutput: tc.expectedOutput,
        input: tc.input,
        hidden: tc.hidden,
      })),
      basicReview: buildBasicReview('COMPILE_ERROR', timeComplexity, spaceComplexity),
    };
  }

  if (errorType === 'TIME_LIMIT_EXCEEDED') {
    return {
      status: 'TIME_LIMIT_EXCEEDED',
      passedCount: sampleTests.length,
      totalCount: allTests.length,
      executionTimeMs: 5000,
      memoryBytes: metrics.memoryBytes,
      stdout: '',
      stderr: 'Time Limit Exceeded on hidden test case',
      testCaseResults: allTests.map((tc, index) => ({
        passed: index < sampleTests.length,
        actualOutput: index < sampleTests.length ? tc.expectedOutput : '',
        expectedOutput: tc.expectedOutput,
        input: tc.input,
        hidden: tc.hidden,
      })),
      basicReview: buildBasicReview('TIME_LIMIT_EXCEEDED', timeComplexity, spaceComplexity),
    };
  }

  if (errorType === 'MEMORY_LIMIT_EXCEEDED') {
    return {
      status: 'MEMORY_LIMIT_EXCEEDED',
      passedCount: sampleTests.length,
      totalCount: allTests.length,
      executionTimeMs: metrics.executionTimeMs,
      memoryBytes: 256 * 1024 * 1024,
      stdout: '',
      stderr: 'Memory Limit Exceeded on hidden test case',
      testCaseResults: allTests.map((tc, index) => ({
        passed: index < sampleTests.length,
        actualOutput: index < sampleTests.length ? tc.expectedOutput : '',
        expectedOutput: tc.expectedOutput,
        input: tc.input,
        hidden: tc.hidden,
      })),
      basicReview: buildBasicReview('MEMORY_LIMIT_EXCEEDED', timeComplexity, spaceComplexity),
    };
  }

  if (errorType === 'RUNTIME_ERROR') {
    return {
      status: 'RUNTIME_ERROR',
      passedCount: Math.min(1, sampleTests.length),
      totalCount: allTests.length,
      executionTimeMs: metrics.executionTimeMs,
      memoryBytes: metrics.memoryBytes,
      stdout: '',
      stderr: 'Runtime Error: index out of bounds',
      testCaseResults: allTests.map((tc, index) => ({
        passed: index === 0 && sampleTests.length > 0,
        actualOutput: index === 0 && sampleTests.length > 0 ? tc.expectedOutput : '',
        expectedOutput: tc.expectedOutput,
        input: tc.input,
        hidden: tc.hidden,
      })),
      basicReview: buildBasicReview('RUNTIME_ERROR', timeComplexity, spaceComplexity),
    };
  }

  const isWrong = errorType === 'WRONG_ANSWER';
  const results: ExecutionTestResult[] = allTests.map((tc, index) => {
    const failIndex = isWrong
      ? (hiddenTests.length > 0 ? sampleTests.length : Math.min(1, allTests.length - 1))
      : -1;
    const failThis = index === failIndex;
    return {
      passed: !failThis,
      actualOutput: failThis ? 'Wrong Output' : tc.expectedOutput,
      expectedOutput: tc.expectedOutput,
      input: tc.input,
      hidden: tc.hidden,
    };
  });

  const passedCount = results.filter((r) => r.passed).length;
  const allPassed = passedCount === allTests.length;

  return {
    status: allPassed ? 'ACCEPTED' : 'WRONG_ANSWER',
    passedCount,
    totalCount: allTests.length,
    executionTimeMs: metrics.executionTimeMs,
    memoryBytes: metrics.memoryBytes,
    stdout: allPassed ? 'All test cases passed' : '',
    stderr: allPassed ? '' : `Wrong Answer: ${passedCount}/${allTests.length} test cases passed`,
    testCaseResults: results,
    basicReview: buildBasicReview(allPassed ? 'ACCEPTED' : 'WRONG_ANSWER', timeComplexity, spaceComplexity),
  };
}

export function formatStatusLabel(status: MockExecutionOutput['status']): string {
  switch (status) {
    case 'ACCEPTED':
      return 'Accepted';
    case 'WRONG_ANSWER':
      return 'Wrong Answer';
    case 'TIME_LIMIT_EXCEEDED':
      return 'Time Limit Exceeded';
    case 'MEMORY_LIMIT_EXCEEDED':
      return 'Memory Limit Exceeded';
    case 'COMPILE_ERROR':
      return 'Compilation Error';
    case 'RUNTIME_ERROR':
      return 'Runtime Error';
    default:
      return status;
  }
}
