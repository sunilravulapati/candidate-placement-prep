import type {
  ExecutionErrorType,
  ExecutionProvider,
  ExecutionRequest,
  ExecutionResult,
  TestCaseResult,
} from './ExecutionProvider';

// ──────────────────────────────────────────────────────────────────────────────
// Judge0 Configuration
// Judge0 language IDs are intentionally private to this file.
// The UI only knows about our internal SupportedLanguage strings.
// ──────────────────────────────────────────────────────────────────────────────

const JUDGE0_ENDPOINT =
  process.env.NEXT_PUBLIC_JUDGE0_ENDPOINT ?? 'https://judge0-ce.p.rapidapi.com';

/** Internal mapping — never exported to the UI layer */
const LANGUAGE_ID_MAP: Record<string, number> = {
  javascript: 63, // Node.js 12.14.0
  python: 71,     // Python 3.8.1
  java: 62,       // Java (OpenJDK 13.0.1)
  cpp: 54,        // C++ (GCC 9.2.0)
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Map Judge0 status codes to our typed error enum */
function mapStatusToErrorType(statusId?: number): ExecutionErrorType | undefined {
  switch (statusId) {
    case 3:  return undefined;               // Accepted
    case 4:  return 'WRONG_ANSWER';
    case 5:  return 'TIME_LIMIT_EXCEEDED';
    case 6:  return 'COMPILE_ERROR';
    default: return statusId && statusId >= 7 ? 'RUNTIME_ERROR' : undefined;
  }
}

// ──────────────────────────────────────────────────────────────────────────────

export class RealExecutionProvider implements ExecutionProvider {
  /** Build request headers, including optional RapidAPI key */
  private get headers(): Record<string, string> {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    const apiKey = process.env.NEXT_PUBLIC_JUDGE0_API_KEY;
    if (apiKey) {
      h['X-RapidAPI-Key'] = apiKey;
      h['X-RapidAPI-Host'] = 'judge0-ce.p.rapidapi.com';
    }
    return h;
  }

  // ── Single Run ─────────────────────────────────────────────────────────────

  async runCode(request: ExecutionRequest): Promise<ExecutionResult> {
    const languageId = LANGUAGE_ID_MAP[request.language];
    if (!languageId) throw new Error(`Unsupported language: ${request.language}`);

    const token = await this.submit(request.code, languageId, request.input ?? '');
    const raw = await this.poll(token);

    return {
      passed: raw.status?.id === 3,
      stdout: raw.stdout ?? '',
      stderr: raw.stderr ?? '',
      compileOutput: raw.compile_output ?? '',
      executionTimeMs: parseFloat(raw.time ?? '0') * 1000,
      memoryBytes: (raw.memory ?? 0) * 1024,
      errorType: mapStatusToErrorType(raw.status?.id),
    };
  }

  // ── Multi-Test Run ─────────────────────────────────────────────────────────

  async runTestCases(request: ExecutionRequest): Promise<ExecutionResult> {
    const languageId = LANGUAGE_ID_MAP[request.language];
    if (!languageId) throw new Error(`Unsupported language: ${request.language}`);
    const testCases = request.testCases ?? [];

    // Submit all cases in parallel and hold raw Judge0 responses
    const rawResults = await Promise.all(
      testCases.map(async (tc) => {
        const token = await this.submit(request.code, languageId, tc.input);
        const raw = await this.poll(token);
        return { tc, raw };
      })
    );

    // Short-circuit on compilation error (any case)
    const compileFailure = rawResults.find((r) => r.raw.status?.id === 6);
    if (compileFailure) {
      return {
        passed: false,
        stdout: '',
        stderr: compileFailure.raw.stderr ?? '',
        compileOutput: compileFailure.raw.compile_output ?? 'Compilation Error',
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

    // Map raw results to TestCaseResult[]
    const caseResults: (TestCaseResult & {
      _errorType?: ExecutionErrorType;
      _stderr: string;
      _executionTimeMs: number;
      _memoryBytes: number;
    })[] = rawResults.map(({ tc, raw }) => {
      const timeMs = parseFloat(raw.time ?? '0') * 1000;
      const memBytes = (raw.memory ?? 0) * 1024;
      const actualOutput = (raw.stdout ?? '').trim();
      const passed =
        raw.status?.id === 3 && actualOutput === tc.expectedOutput.trim();
      return {
        passed,
        actualOutput,
        expectedOutput: tc.expectedOutput,
        input: tc.input,
        executionTimeMs: timeMs,
        memoryBytes: memBytes,
        _errorType: mapStatusToErrorType(raw.status?.id),
        _stderr: raw.stderr ?? '',
        _executionTimeMs: timeMs,
        _memoryBytes: memBytes,
      };
    });

    const allPassed = caseResults.every((r) => r.passed);
    const totalTimeMs = caseResults.reduce((s, r) => s + r._executionTimeMs, 0);
    const maxMemBytes = Math.max(...caseResults.map((r) => r._memoryBytes), 0);
    const firstError = caseResults.find((r) => r._errorType);

    return {
      passed: allPassed,
      stdout: caseResults.map((r) => r.actualOutput).join('\n').trim(),
      stderr: firstError?._stderr ?? '',
      compileOutput: '',
      executionTimeMs: totalTimeMs,
      memoryBytes: maxMemBytes,
      errorType: firstError?._errorType ?? (allPassed ? undefined : 'WRONG_ANSWER'),
      testCaseResults: caseResults.map(({ passed, actualOutput, expectedOutput, input, executionTimeMs, memoryBytes }) => ({
        passed,
        actualOutput,
        expectedOutput,
        input,
        executionTimeMs,
        memoryBytes,
      })),
    };
  }

  // ── Private Helpers ────────────────────────────────────────────────────────

  private async submit(code: string, languageId: number, stdin = ''): Promise<string> {
    const response = await fetch(
      `${JUDGE0_ENDPOINT}/submissions?base64_encoded=false&wait=false`,
      {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ source_code: code, language_id: languageId, stdin }),
      }
    );
    if (!response.ok) throw new Error(`Judge0 submit failed: ${response.status}`);
    const data = await response.json();
    if (!data.token) throw new Error('Failed to obtain submission token from Judge0');
    return data.token;
  }

  private async poll(token: string): Promise<any> {
    for (let attempt = 0; attempt < 20; attempt++) {
      const resp = await fetch(
        `${JUDGE0_ENDPOINT}/submissions/${token}?base64_encoded=false&fields=stdout,stderr,status_id,status,time,memory,compile_output`,
        { headers: this.headers }
      );
      const data = await resp.json();
      const statusObj = data.status as { id?: number } | undefined;
      const statusId = statusObj?.id ?? (data.status_id as number | undefined);
      if (typeof statusId === 'number' && statusId >= 3) return data;
      await delay(500);
    }
    throw new Error('Execution timed out waiting for Judge0 response');
  }
}
