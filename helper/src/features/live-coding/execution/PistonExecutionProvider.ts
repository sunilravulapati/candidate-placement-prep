import type { ExecutionRequest } from './ExecutionProvider';
import type { RawExecutionOutput } from './VerdictEngine';

const PISTON_LANGUAGES: Record<string, { language: string; version: string }> = {
  cpp: { language: 'cpp', version: '*' },
  python: { language: 'python', version: '*' },
  java: { language: 'java', version: '*' },
  javascript: { language: 'javascript', version: '*' },
  typescript: { language: 'typescript', version: '*' },
};

export class PistonExecutionProvider {
  readonly name = 'Piston';

  private get endpoint(): string {
    const env = process.env.NEXT_PUBLIC_PISTON_ENDPOINT;
    if (!env || env.includes('emkc.org')) {
      return 'http://localhost:20000/api/v2';
    }
    return env;
  }

  async executeRaw(code: string, language: string, stdin = ''): Promise<RawExecutionOutput> {
    const langConfig = PISTON_LANGUAGES[language.toLowerCase()] ?? {
      language: language.toLowerCase(),
      version: '*',
    };

    const startTime = performance.now();

    const url = `${this.endpoint}/execute`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: langConfig.language,
        version: langConfig.version,
        files: [{ content: code }],
        stdin: stdin,
      }),
    });

    const endTime = performance.now();
    const elapsedMs = Math.round(endTime - startTime);

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`Piston API error (${response.status}): ${errText || response.statusText}`);
    }

    const data = await response.json();

    const compileStderr = data.compile?.stderr ?? '';
    const compileStdout = data.compile?.stdout ?? '';
    const compileCode = data.compile?.code ?? 0;
    const isCompileError =
      compileCode !== 0 ||
      compileStderr.includes('error:') ||
      compileStderr.includes('undefined reference');

    const runStdout = data.run?.stdout ?? '';
    const runStderr = data.run?.stderr ?? '';
    const runCode = data.run?.code ?? 0;
    const runSignal = data.run?.signal ?? null;

    return {
      stdout: runStdout,
      stderr: isCompileError ? compileStderr : runStderr,
      compileOutput: compileStderr || compileStdout,
      executionTimeMs: elapsedMs,
      memoryBytes: 10 * 1024 * 1024,
      exitCode: isCompileError ? compileCode : runCode,
      signal: runSignal,
      timedOut: runSignal === 'SIGKILL' || runSignal === 'SIGXCPU',
      isCompileError,
    };
  }

  async runSingle(request: ExecutionRequest): Promise<RawExecutionOutput> {
    return this.executeRaw(request.code, request.language, request.input ?? '');
  }

  async runMultiple(request: ExecutionRequest): Promise<RawExecutionOutput[]> {
    const testCases = request.testCases ?? [];
    if (testCases.length === 0) {
      return [await this.runSingle(request)];
    }

    return Promise.all(
      testCases.map((tc) => this.executeRaw(request.code, request.language, tc.input))
    );
  }
}
