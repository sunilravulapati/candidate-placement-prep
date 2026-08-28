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
      executionMode = 'run', // 'run' | 'submit'
      executionType = 'STANDARD_V1', // 'STANDARD_V1' (default) | 'FUNCTION_V2' | 'DESIGN_V2'
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

    // In V1 standard execution model, user writes complete program with main().
    // V2 wrapper generation is isolated and only executed when executionType !== 'STANDARD_V1'.
    let executableCode = code;
    if (executionType !== 'STANDARD_V1' && metaToUse && execMetaToUse) {
      try {
        executableCode = WrapperGenerator.generateWrapper(
          metaToUse,
          execMetaToUse,
          code,
          language as SupportedLanguage,
          driverMetaToUse
        );
      } catch (err) {
        console.warn('V2 wrapper generation warning:', (err as Error).message);
      }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // RUN MODE: Executes VISIBLE test cases ONLY
    // ──────────────────────────────────────────────────────────────────────────
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

    // ──────────────────────────────────────────────────────────────────────────
    // SUBMIT MODE: Executes VISIBLE + HIDDEN test cases
    // ──────────────────────────────────────────────────────────────────────────
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

    // Secure Hidden Tests: NEVER expose hidden input, expected output, or hidden test data
    const sanitizedHiddenResults = hiddenCaseResults.map((c, idx) => ({
      index: normVisible.length + idx + 1,
      passed: c.passed,
      executionTimeMs: c.executionTimeMs,
      memoryBytes: c.memoryBytes,
      errorType: (c as any).errorType,
      category: (hiddenToRun[idx] as any)?.classification || 'hidden',
    }));

    const isAllPassed =
      normVisible.length > 0 &&
      visiblePassed === normVisible.length &&
      (normHidden.length === 0 || hiddenPassed === normHidden.length);

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
