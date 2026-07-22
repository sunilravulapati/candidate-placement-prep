import type { ExecutionRequest } from './ExecutionProvider';
import type { RawExecutionOutput } from './VerdictEngine';

const LANGUAGE_ID_MAP: Record<string, number> = {
  javascript: 63, // Node.js 12.14.0
  python: 71,     // Python 3.8.1
  java: 62,       // Java (OpenJDK 13.0.1)
  cpp: 54,        // C++ (GCC 9.2.0)
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function wrapCodeForExecution(code: string, language: string): string {
  const lang = language.toLowerCase();

  // C++ main function wrapper if missing
  if (lang === 'cpp' && !code.includes('int main(') && !code.includes('int main (')) {
    const hasStdInclude = code.includes('#include');
    const headerPrefix = hasStdInclude ? '' : '#include <iostream>\n#include <vector>\n#include <string>\n#include <cctype>\nusing namespace std;\n\n';
    
    const methodName = code.includes('twoSum(') ? 'twoSum' : 'solver';

    return `${headerPrefix}${code}

int main() {
    Solution sol;
    string s1, s2;
    if (cin >> s1) {
        cin >> s2;
        vector<int> nums;
        string current = "";
        for (char c : s1) {
            if (isdigit(c) || c == '-') {
                current += c;
            } else if (!current.empty()) {
                nums.push_back(stoi(current));
                current = "";
            }
        }
        if (!current.empty()) nums.push_back(stoi(current));

        int target = 0;
        if (!s2.empty()) {
            string tStr = "";
            for (char c : s2) {
                if (isdigit(c) || c == '-') tStr += c;
            }
            if (!tStr.empty()) target = stoi(tStr);
        }

        auto res = sol.${methodName}(nums, target);
        cout << "[";
        for (size_t i = 0; i < res.size(); i++) {
            cout << res[i] << (i + 1 == res.size() ? "" : ",");
        }
        cout << "]" << endl;
    } else {
        vector<int> nums = {2, 7, 11, 15};
        auto res = sol.${methodName}(nums, 9);
        cout << "[";
        for (size_t i = 0; i < res.size(); i++) {
            cout << res[i] << (i + 1 == res.size() ? "" : ",");
        }
        cout << "]" << endl;
    }
    return 0;
}
`;
  }

  // Java main function wrapper if missing
  if (lang === 'java' && !code.includes('public static void main')) {
    if (code.includes('class Solution')) {
      return code.replace(
        /class\s+Solution\s*\{/,
        'class Solution {\n    public static void main(String[] args) {\n        Solution sol = new Solution();\n    }'
      );
    }
  }

  // Python wrapper if missing
  if (lang === 'python' && !code.includes('if __name__')) {
    return `${code}\n\nif __name__ == '__main__':\n    sol = Solution()\n`;
  }

  return code;
}

export class Judge0ExecutionProvider {
  readonly name = 'Judge0';

  private get endpoint(): string {
    return process.env.NEXT_PUBLIC_JUDGE0_ENDPOINT ?? 'https://judge0-ce.p.rapidapi.com';
  }

  private get headers(): Record<string, string> {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    const apiKey = process.env.NEXT_PUBLIC_JUDGE0_API_KEY;
    if (apiKey) {
      h['X-RapidAPI-Key'] = apiKey;
      h['X-RapidAPI-Host'] = 'judge0-ce.p.rapidapi.com';
    }
    return h;
  }

  /** Check if Judge0 is configured (has endpoint or API key) */
  isConfigured(): boolean {
    const apiKey = process.env.NEXT_PUBLIC_JUDGE0_API_KEY;
    const endpoint = process.env.NEXT_PUBLIC_JUDGE0_ENDPOINT;
    if (endpoint?.includes('rapidapi.com') && !apiKey) {
      return false;
    }
    return Boolean(endpoint || apiKey);
  }

  async executeRaw(code: string, language: string, stdin = ''): Promise<RawExecutionOutput> {
    if (!this.isConfigured()) {
      throw new Error(
        'Judge0 configuration error: NEXT_PUBLIC_JUDGE0_API_KEY or valid NEXT_PUBLIC_JUDGE0_ENDPOINT is missing. Please set NEXT_PUBLIC_JUDGE0_API_KEY or switch provider.'
      );
    }

    const languageId = LANGUAGE_ID_MAP[language.toLowerCase()];
    if (!languageId) {
      throw new Error(`Judge0: Unsupported language "${language}"`);
    }

    const executableCode = wrapCodeForExecution(code, language);
    const token = await this.submit(executableCode, languageId, stdin);
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
      throw new Error(`Judge0 submit failed with HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    if (!data.token) throw new Error('Failed to obtain submission token from Judge0');
    return data.token;
  }

  private async poll(token: string): Promise<any> {
    for (let attempt = 0; attempt < 20; attempt++) {
      const resp = await fetch(
        `${this.endpoint}/submissions/${token}?base64_encoded=false&fields=stdout,stderr,status_id,status,time,memory,compile_output`,
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
