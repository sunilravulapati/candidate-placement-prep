import type { ExecutionRequest } from './ExecutionProvider';
import type { RawExecutionOutput } from './VerdictEngine';

export interface PistonRuntime {
  language: string;
  version: string;
  aliases: string[];
  runtime?: string;
}

export class PistonExecutionProvider {
  readonly name = 'Piston';
  private runtimesCache: PistonRuntime[] | null = null;

  private get endpoint(): string {
    const env = process.env.NEXT_PUBLIC_PISTON_ENDPOINT;
    if (!env || env.includes('emkc.org')) {
      return 'http://127.0.0.1:20000/api/v2';
    }
    return env.replace('localhost', '127.0.0.1');
  }

  /**
   * Dynamically fetch and cache installed runtimes from local Piston container
   */
  async getInstalledRuntimes(forceRefresh = false): Promise<PistonRuntime[]> {
    if (this.runtimesCache && !forceRefresh) return this.runtimesCache;
    try {
      const resp = await fetch(`${this.endpoint}/runtimes`);
      if (resp.ok) {
        const list = await resp.json();
        if (Array.isArray(list)) {
          this.runtimesCache = list;
          return list;
        }
      }
    } catch {
      // Container unreachable
    }
    return [];
  }

  /**
   * Resolve exact installed runtime language name and version
   */
  async resolveRuntime(langKey: string): Promise<{ language: string; version: string }> {
    const normalized = langKey.toLowerCase().trim();
    let runtimes = await this.getInstalledRuntimes();

    let match = runtimes.find((r) => {
      const langMatch = r.language.toLowerCase() === normalized;
      const aliasMatch = Array.isArray(r.aliases) && r.aliases.some((a) => a.toLowerCase() === normalized);
      return langMatch || aliasMatch;
    });

    if (!match) {
      // Invalidate cache and retry once to pick up newly installed container packages
      runtimes = await this.getInstalledRuntimes(true);
      match = runtimes.find((r) => {
        const langMatch = r.language.toLowerCase() === normalized;
        const aliasMatch = Array.isArray(r.aliases) && r.aliases.some((a) => a.toLowerCase() === normalized);
        return langMatch || aliasMatch;
      });
    }

    if (match) {
      return { language: match.language, version: match.version };
    }

    // Static fallback map if runtimes endpoint didn't respond
    const staticMap: Record<string, { language: string; version: string }> = {
      cpp: { language: 'c++', version: '10.2.0' },
      'c++': { language: 'c++', version: '10.2.0' },
      python: { language: 'python', version: '3.10.0' },
      java: { language: 'java', version: '15.0.2' },
      javascript: { language: 'javascript', version: '18.15.0' },
      typescript: { language: 'typescript', version: '5.0.3' },
    };

    if (staticMap[normalized]) {
      return staticMap[normalized];
    }

    throw new Error(`Piston: Language "${langKey}" is not installed in local Piston container.`);
  }

  async executeRaw(code: string, language: string, stdin = ''): Promise<RawExecutionOutput> {
    const langConfig = await this.resolveRuntime(language);

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

    const lang = request.language.toLowerCase();
    // Heavy compiled languages (Java, C++) execute sequentially to prevent container CPU throttling & SIGKILL timeouts
    if (lang === 'java' || lang === 'cpp' || lang === 'c++') {
      const results: RawExecutionOutput[] = [];
      for (const tc of testCases) {
        results.push(await this.executeRaw(request.code, request.language, tc.input));
      }
      return results;
    }

    return Promise.all(
      testCases.map((tc) => this.executeRaw(request.code, request.language, tc.input))
    );
  }
}
