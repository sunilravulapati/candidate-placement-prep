import { NextResponse } from 'next/server';
import { executionEngine } from '@/features/live-coding/execution/ExecutionEngine';
import { WrapperGenerator } from '@backend/features/dsa/wrapperGenerator';
import { CodingProblemRepository } from '@backend/features/liveCoding/repository';
import type { SupportedLanguage } from '@/features/live-coding/language-config';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, language, problemSlug, testCases, starterMetadata, executionMetadata, driverMetadata } = body;

    let metaToUse = starterMetadata;
    let execMetaToUse = executionMetadata;
    let driverMetaToUse = driverMetadata;

    if (!metaToUse && problemSlug) {
      const problem = await CodingProblemRepository.getProblemBySlug(problemSlug);
      if (problem) {
        metaToUse = (problem as any).starterMetadata;
        execMetaToUse = (problem as any).executionMetadata;
        driverMetaToUse = (problem as any).driverMetadata;
      }
    }

    let executableCode = code;
    if (metaToUse && execMetaToUse) {
      try {
        executableCode = WrapperGenerator.generateWrapper(
          metaToUse,
          execMetaToUse,
          code,
          language as SupportedLanguage,
          driverMetaToUse
        );
      } catch (err) {
        console.warn('Wrapper generation warning:', (err as Error).message);
      }
    }

    const requestObj = {
      code: executableCode,
      language,
      testCases,
    };

    const isSingleRun = !testCases || testCases.length === 0;

    let result;
    if (isSingleRun) {
      result = await executionEngine.runCode(requestObj);
    } else {
      result = await executionEngine.runTestCases(requestObj);
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
