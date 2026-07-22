import { NextResponse } from 'next/server';
import { executionEngine } from '@/features/live-coding/execution/ExecutionEngine';
import type { ExecutionRequest } from '@/features/live-coding/execution/ExecutionProvider';

export async function POST(req: Request) {
  try {
    const body: ExecutionRequest = await req.json();
    const isSingleRun = !body.testCases || body.testCases.length === 0;

    let result;
    if (isSingleRun) {
      result = await executionEngine.runCode(body);
    } else {
      result = await executionEngine.runTestCases(body);
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Execution failed';
    return NextResponse.json(
      {
        passed: false,
        stdout: '',
        stderr: msg,
        compileOutput: '',
        executionTimeMs: 0,
        memoryBytes: 0,
        errorType: 'RUNTIME_ERROR',
        providerName: 'Server Error',
      },
      { status: 500 }
    );
  }
}
