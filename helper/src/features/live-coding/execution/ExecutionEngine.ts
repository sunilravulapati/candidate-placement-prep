import type { ExecutionProvider, ExecutionRequest, ExecutionResult } from './ExecutionProvider';
import { PistonExecutionProvider } from './PistonExecutionProvider';
import { Judge0ExecutionProvider } from './Judge0ExecutionProvider';
import { MockExecutionProvider } from './MockExecutionProvider';
import { VerdictEngine, type RawExecutionOutput } from './VerdictEngine';

export type ProviderType = 'piston' | 'judge0' | 'mock';

export class UnifiedExecutionEngine implements ExecutionProvider {
  private pistonProvider = new PistonExecutionProvider();
  private judge0Provider = new Judge0ExecutionProvider();
  private mockProvider = new MockExecutionProvider();

  /**
   * Determine the current configured primary provider type based on NEXT_PUBLIC_EXECUTION_PROVIDER
   */
  getProviderType(): ProviderType {
    const envProvider = (
      process.env.NEXT_PUBLIC_EXECUTION_PROVIDER ?? ''
    ).toLowerCase().trim();

    if (envProvider === 'piston') return 'piston';
    if (envProvider === 'judge0') return 'judge0';
    if (envProvider === 'mock') return 'mock';

    // Auto-selection default
    if (process.env.NEXT_PUBLIC_JUDGE0_API_KEY) {
      return 'judge0';
    }
    return 'piston';
  }

  /**
   * Human-readable label for DSA Studio indicator badge
   */
  getActiveProviderName(): string {
    const type = this.getProviderType();
    switch (type) {
      case 'piston':
        return 'Piston Local';
      case 'judge0':
        return 'Judge0';
      case 'mock':
        return 'Mock';
    }
  }

  async runCode(request: ExecutionRequest): Promise<ExecutionResult> {
    const primary = this.getProviderType();

    // 1. Attempt Primary Provider
    try {
      let raw: RawExecutionOutput;
      if (primary === 'piston') {
        raw = await this.pistonProvider.runSingle(request);
      } else if (primary === 'judge0') {
        raw = await this.judge0Provider.runSingle(request);
      } else {
        raw = await this.mockProvider.runSingle(request);
      }

      const result = VerdictEngine.evaluateSingle(raw, undefined);
      result.providerName = this.getActiveProviderName();
      return result;
    } catch (primaryErr: unknown) {
      console.warn(`Primary provider (${primary}) execution failed:`, primaryErr);

      // 2. Attempt Secondary Fallback (Judge0 -> Mock or Piston -> Judge0 -> Mock)
      if (primary !== 'mock' && this.judge0Provider.isConfigured()) {
        try {
          const raw = await this.judge0Provider.runSingle(request);
          const result = VerdictEngine.evaluateSingle(raw, undefined);
          result.providerName = 'Judge0 (Fallback)';
          return result;
        } catch {
          // Fall through to Mock
        }
      }

      // 3. Final Fail-safe Fallback to Mock Provider (Workspace never crashes!)
      const raw = await this.mockProvider.runSingle(request);
      const res = VerdictEngine.evaluateSingle(raw, undefined);
      res.providerName = `${this.getActiveProviderName()} (Fallback to Mock)`;
      return res;
    }
  }

  async runTestCases(request: ExecutionRequest): Promise<ExecutionResult> {
    const primary = this.getProviderType();
    const testCases = request.testCases ?? [];

    // 1. Attempt Primary Provider
    try {
      let raws: RawExecutionOutput[];
      if (primary === 'piston') {
        raws = await this.pistonProvider.runMultiple(request);
      } else if (primary === 'judge0') {
        raws = await this.judge0Provider.runMultiple(request);
      } else {
        raws = await this.mockProvider.runMultiple(request);
      }

      const result = VerdictEngine.evaluateTestCases(testCases, raws);
      result.providerName = this.getActiveProviderName();
      return result;
    } catch (primaryErr: unknown) {
      console.warn(`Primary provider (${primary}) testcase execution failed:`, primaryErr);

      // 2. Attempt Secondary Fallback (Judge0)
      if (primary !== 'mock' && this.judge0Provider.isConfigured()) {
        try {
          const raws = await this.judge0Provider.runMultiple(request);
          const result = VerdictEngine.evaluateTestCases(testCases, raws);
          result.providerName = 'Judge0 (Fallback)';
          return result;
        } catch {
          // Fall through to Mock
        }
      }

      // 3. Final Fail-safe Fallback to Mock Provider
      const raws = await this.mockProvider.runMultiple(request);
      const res = VerdictEngine.evaluateTestCases(testCases, raws);
      res.providerName = `${this.getActiveProviderName()} (Fallback to Mock)`;
      return res;
    }
  }
}

export const executionEngine = new UnifiedExecutionEngine();
