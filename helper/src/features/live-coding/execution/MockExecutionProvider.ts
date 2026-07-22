import type { ExecutionRequest } from './ExecutionProvider';
import type { RawExecutionOutput } from './VerdictEngine';

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export class MockExecutionProvider {
  readonly name = 'Mock';

  async executeRaw(code: string, stdin = ''): Promise<RawExecutionOutput> {
    await delay(600);
    const lower = code.toLowerCase();

    if (lower.includes('// compile error')) {
      return {
        stdout: '',
        stderr: "error: expected ';' before '}' token\n  10 | }\n     | ^",
        compileOutput: "error: expected ';' before '}' token\n  10 | }\n     | ^",
        executionTimeMs: 0,
        memoryBytes: 0,
        exitCode: 1,
        isCompileError: true,
      };
    }
    if (lower.includes('// tle')) {
      return {
        stdout: '',
        stderr: 'Time limit exceeded after 5000 ms',
        compileOutput: '',
        executionTimeMs: 5000,
        memoryBytes: 15 * 1024 * 1024,
        timedOut: true,
        signal: 'SIGKILL',
      };
    }
    if (lower.includes('// runtime error')) {
      return {
        stdout: '',
        stderr: 'Runtime Error: index out of range (index 5, size 3)',
        compileOutput: '',
        executionTimeMs: 12,
        memoryBytes: 12 * 1024 * 1024,
        exitCode: 139,
      };
    }
    if (lower.includes('// wrong')) {
      return {
        stdout: 'Wrong Output',
        stderr: '',
        compileOutput: '',
        executionTimeMs: 45,
        memoryBytes: 12 * 1024 * 1024,
        exitCode: 0,
      };
    }

    return {
      stdout: stdin ? `Simulated Output for input: ${stdin.trim()}` : 'Accepted Output',
      stderr: '',
      compileOutput: '',
      executionTimeMs: 42,
      memoryBytes: 12 * 1024 * 1024,
      exitCode: 0,
    };
  }

  async runSingle(request: ExecutionRequest): Promise<RawExecutionOutput> {
    return this.executeRaw(request.code, request.input ?? '');
  }

  async runMultiple(request: ExecutionRequest): Promise<RawExecutionOutput[]> {
    const testCases = request.testCases ?? [];
    if (testCases.length === 0) {
      return [await this.runSingle(request)];
    }
    return Promise.all(testCases.map((tc) => this.executeRaw(request.code, tc.input)));
  }
}
