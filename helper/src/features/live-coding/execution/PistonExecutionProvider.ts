import type { ExecutionRequest } from './ExecutionProvider';
import type { RawExecutionOutput } from './VerdictEngine';

const PISTON_LANGUAGES: Record<string, { language: string; version: string }> = {
  cpp: { language: 'cpp', version: '*' },
  python: { language: 'python', version: '*' },
  java: { language: 'java', version: '*' },
  javascript: { language: 'javascript', version: '*' },
};

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

export class PistonExecutionProvider {
  readonly name = 'Piston';

  private get endpoint(): string {
    const env = process.env.NEXT_PUBLIC_PISTON_ENDPOINT;
    // Default to local Piston container if env is unset or set to the legacy emkc public URL
    if (!env || env.includes('emkc.org')) {
      return 'http://localhost:20000/api/v2';
    }
    return env;
  }

  async executeRaw(code: string, language: string, stdin = ''): Promise<RawExecutionOutput> {
    const langConfig = PISTON_LANGUAGES[language.toLowerCase()] ?? {
      language,
      version: '*',
    };

    const executableCode = wrapCodeForExecution(code, language);
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
        files: [{ content: executableCode }],
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
