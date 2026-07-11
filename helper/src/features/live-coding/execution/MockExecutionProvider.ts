import { ExecutionProvider, ExecutionRequest, ExecutionResult } from './ExecutionProvider';

export class MockExecutionProvider implements ExecutionProvider {
  
  async runCode(request: ExecutionRequest): Promise<ExecutionResult> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const code = request.code.toLowerCase();

    if (code.includes('// compile error')) {
      return { passed: false, stdout: '', stderr: 'SyntaxError: Unexpected token', executionTimeMs: 0, memoryBytes: 0, errorType: 'Compilation Error' };
    }
    if (code.includes('// tle')) {
      return { passed: false, stdout: '', stderr: 'Time Limit Exceeded', executionTimeMs: 5000, memoryBytes: 1024 * 1024 * 15, errorType: 'TLE' };
    }
    if (code.includes('// mle')) {
      return { passed: false, stdout: '', stderr: 'Memory Limit Exceeded', executionTimeMs: 45, memoryBytes: 1024 * 1024 * 250, errorType: 'MLE' };
    }
    if (code.includes('// wrong')) {
      return { passed: false, stdout: 'Some output', stderr: '', executionTimeMs: 45, memoryBytes: 1024 * 1024 * 12, errorType: 'Wrong Answer' };
    }
    
    return {
      passed: true,
      stdout: 'Hello World\n',
      stderr: '',
      executionTimeMs: 45,
      memoryBytes: 1024 * 1024 * 12,
    };
  }

  async runTestCases(request: ExecutionRequest): Promise<ExecutionResult> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    const code = request.code.toLowerCase();

    if (code.includes('// compile error')) {
      return { passed: false, stdout: '', stderr: 'SyntaxError: Unexpected token', executionTimeMs: 0, memoryBytes: 0, errorType: 'Compilation Error', testCaseResults: request.testCases?.map(tc => ({ passed: false, expectedOutput: tc.expectedOutput, actualOutput: '' })) };
    }
    if (code.includes('// tle')) {
      return { passed: false, stdout: '', stderr: 'Time Limit Exceeded', executionTimeMs: 5000, memoryBytes: 1024 * 1024 * 15, errorType: 'TLE', testCaseResults: request.testCases?.map(tc => ({ passed: false, expectedOutput: tc.expectedOutput, actualOutput: '' })) };
    }
    if (code.includes('// mle')) {
      return { passed: false, stdout: '', stderr: 'Memory Limit Exceeded', executionTimeMs: 45, memoryBytes: 1024 * 1024 * 250, errorType: 'MLE', testCaseResults: request.testCases?.map(tc => ({ passed: false, expectedOutput: tc.expectedOutput, actualOutput: '' })) };
    }

    const isWrong = code.includes('// wrong');

    const results = request.testCases?.map((tc, index) => {
      // If wrong, fail the second test case (if exists) or the first
      const failThis = isWrong && (index === 1 || (index === 0 && request.testCases!.length === 1));
      return {
        passed: !failThis,
        actualOutput: failThis ? 'Wrong Output' : tc.expectedOutput,
        expectedOutput: tc.expectedOutput,
      };
    }) || [];

    const allPassed = results.length > 0 && results.every(r => r.passed);

    return {
      passed: allPassed,
      stdout: '',
      stderr: '',
      executionTimeMs: 55,
      memoryBytes: 1024 * 1024 * 14,
      errorType: allPassed ? undefined : 'Wrong Answer',
      testCaseResults: results
    };
  }
}
