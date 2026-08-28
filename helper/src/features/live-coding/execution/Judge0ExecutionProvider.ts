import type { ExecutionRequest } from './ExecutionProvider';
import type { RawExecutionOutput } from './VerdictEngine';

const LANGUAGE_ID_MAP: Record<string, number> = {
  javascript: 63, // Node.js 12.14.0
  typescript: 74, // TypeScript 3.7.4
  python: 71,     // Python 3.8.1
  java: 62,       // Java (OpenJDK 13.0.1)
  cpp: 54,        // C++ (GCC 9.2.0)
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class Judge0ExecutionProvider {
  readonly name = 'Judge0';

  private get endpoint(): string {
    const raw = process.env.NEXT_PUBLIC_JUDGE0_ENDPOINT || 'http://127.0.0.1:2358';
    return raw.replace('localhost', '127.0.0.1');
  }

  private get headers(): Record<string, string> {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    const apiKey = process.env.NEXT_PUBLIC_JUDGE0_API_KEY;
    if (apiKey && apiKey !== 'your_rapidapi_judge0_key' && this.endpoint.includes('rapidapi.com')) {
      h['X-RapidAPI-Key'] = apiKey;
      h['X-RapidAPI-Host'] = 'judge0-ce.p.rapidapi.com';
    }
    return h;
  }

  /** Check if Judge0 is configured (self-hosted endpoint or valid API key) */
  isConfigured(): boolean {
    const apiKey = process.env.NEXT_PUBLIC_JUDGE0_API_KEY;
    const endpoint = this.endpoint;
    if (endpoint.includes('rapidapi.com') && (!apiKey || apiKey === 'your_rapidapi_judge0_key')) {
      return false;
    }
    return true;
  }

  async executeRaw(code: string, language: string, stdin = ''): Promise<RawExecutionOutput> {
    if (!this.isConfigured()) {
      throw new Error(
        'Judge0 configuration error: NEXT_PUBLIC_JUDGE0_ENDPOINT is missing or invalid. Please check your self-hosted Judge0 setup.'
      );
    }

    const languageId = LANGUAGE_ID_MAP[language.toLowerCase()];
    if (!languageId) {
      throw new Error(`Judge0: Unsupported language "${language}"`);
    }

    const token = await this.submit(code, languageId, stdin);
    const raw = await this.poll(token);

    const statusId = raw.status?.id ?? raw.status_id;
    const isCompileError = statusId === 6;
    const isTLE = statusId === 5;
    const isRuntimeError = typeof statusId === 'number' && statusId >= 7;

    const compileOutput = raw.compile_output || (isCompileError ? raw.stderr || raw.stdout : '');

    return {
      stdout: raw.stdout ?? '',
      stderr: raw.stderr ?? '',
      compileOutput: compileOutput ?? '',
      executionTimeMs: parseFloat(raw.time ?? '0') * 1000,
      memoryBytes: (raw.memory ?? 0) * 1024,
      exitCode: isCompileError || isRuntimeError ? 1 : 0,
      timedOut: isTLE,
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

  private async submit(code: string, languageId: number, stdin = ''): Promise<string> {
    const response = await fetch(
      `${this.endpoint}/submissions?base64_encoded=false&wait=false`,
      {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ source_code: code, language_id: languageId, stdin }),
      }
    );
    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`Judge0 submit failed with HTTP ${response.status}: ${errText || response.statusText}`);
    }
    const text = await response.text();
    if (!text || !text.trim()) {
      throw new Error('Judge0 returned empty response on submission creation');
    }
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Judge0 returned invalid JSON response on submission: ${text.slice(0, 100)}`);
    }
    if (!data?.token) throw new Error('Failed to obtain submission token from Judge0');
    return data.token;
  }

  private async poll(token: string): Promise<any> {
    for (let attempt = 0; attempt < 20; attempt++) {
      const resp = await fetch(
        `${this.endpoint}/submissions/${token}?base64_encoded=false&fields=stdout,stderr,status_id,status,time,memory,compile_output`,
        { headers: this.headers }
      );
      if (!resp.ok) {
        const errText = await resp.text().catch(() => '');
        throw new Error(`Judge0 poll failed with HTTP ${resp.status}: ${errText || resp.statusText}`);
      }
      const text = await resp.text();
      if (!text || !text.trim()) {
        await delay(500);
        continue;
      }
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        await delay(500);
        continue;
      }
      const statusObj = data?.status as { id?: number } | undefined;
      const statusId = statusObj?.id ?? (data?.status_id as number | undefined);
      if (typeof statusId === 'number' && statusId >= 3) return data;
      await delay(500);
    }
    throw new Error('Execution timed out waiting for Judge0 response');
  }
}
