import { NextResponse } from 'next/server';
import { executionEngine } from '@/features/live-coding/execution/ExecutionEngine';
import { normalizeTestCases, normalizeTestInput } from '@/features/live-coding/execution/inputNormalizer';
import { WrapperGenerator } from '@backend/features/dsa/wrapperGenerator';
import { CodingProblemRepository } from '@backend/features/liveCoding/repository';
import type { SupportedLanguage } from '@/features/live-coding/language-config';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      code,
      language,
      problemSlug,
      executionMode = 'run',
      input,
      testCases,
      sampleTests,
      hiddenTests,
      starterMetadata,
      executionMetadata,
      driverMetadata,
    } = body;

    let metaToUse = starterMetadata;
    let execMetaToUse = executionMetadata;
    let driverMetaToUse = driverMetadata;

    let probSampleTests = sampleTests;
    let probHiddenTests = hiddenTests;

    if (problemSlug) {
      const problem = await CodingProblemRepository.getProblemBySlug(problemSlug);
      if (problem) {
        metaToUse = (problem as any).starterMetadata || metaToUse;
        execMetaToUse = (problem as any).executionMetadata || execMetaToUse;
        driverMetaToUse = (problem as any).driverMetadata || driverMetaToUse;
        probSampleTests = probSampleTests || problem.sampleTests;
        probHiddenTests = probHiddenTests || problem.hiddenTests;
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

    if (executionMode === 'run') {
      const visibleToRun = Array.isArray(sampleTests)
        ? sampleTests
        : Array.isArray(testCases)
        ? testCases
        : probSampleTests || [];

      const normalizedVisible = normalizeTestCases(visibleToRun);

      if (normalizedVisible.length === 0 && input) {
        const normalizedInput = normalizeTestInput(input);
        const result = await executionEngine.runCode({
          code: executableCode,
          language,
          input: normalizedInput,
        });
        return NextResponse.json({ ...result, executionMode: 'run' });
      }

      const requestObj = {
        code: executableCode,
        language,
        testCases: normalizedVisible,
      };

      const result = await executionEngine.runTestCases(requestObj);
      return NextResponse.json({
        ...result,
        executionMode: 'run',
      });
    }

    // SUBMIT MODE
    const visibleToRun = probSampleTests || [];
    const hiddenToRun = probHiddenTests || [];

    const normVisible = normalizeTestCases(visibleToRun);
    const normHidden = normalizeTestCases(hiddenToRun);

    const allToRun = [...normVisible, ...normHidden];
    const requestObj = {
      code: executableCode,
      language,
      testCases: allToRun,
    };

    const rawResult = await executionEngine.runTestCases(requestObj);
    const rawCaseResults = rawResult.testCaseResults || [];

    const visibleCaseResults = rawCaseResults.slice(0, normVisible.length);
    const hiddenCaseResults = rawCaseResults.slice(normVisible.length);

    const visiblePassed = visibleCaseResults.filter((c) => c.passed).length;
    const hiddenPassed = hiddenCaseResults.filter((c) => c.passed).length;

    // Secure Hidden Tests: NEVER expose hidden input, hidden output, or expected output
    const sanitizedHiddenResults = hiddenCaseResults.map((c, idx) => ({
      index: normVisible.length + idx + 1,
      passed: c.passed,
      executionTimeMs: c.executionTimeMs,
      memoryBytes: c.memoryBytes,
      errorType: (c as any).errorType,
      category: (hiddenToRun[idx] as any)?.classification || 'hidden',
    }));

    const isAllPassed = visiblePassed === normVisible.length && hiddenPassed === normHidden.length;

    return NextResponse.json({
      ...rawResult,
      passed: isAllPassed,
      executionMode: 'submit',
      visibleStats: {
        passed: visiblePassed,
        total: normVisible.length,
      },
      hiddenStats: {
        passed: hiddenPassed,
        total: normHidden.length,
      },
      visibleCaseResults,
      hiddenCaseResultsSanitized: sanitizedHiddenResults,
    });
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
        providerName: 'Server Execution Provider',
      },
      { status: 200 }
    );
  }
}
