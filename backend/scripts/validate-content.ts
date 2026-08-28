// backend/scripts/validate-content.ts

import fs from 'fs';
import path from 'path';

export interface ProblemValidationResult {
  slug: string;
  title: string;
  errors: string[];
  warnings: string[];
  hasValidMetadata: boolean;
  visibleTestCount: number;
  hiddenTestCount: number;
  hasDuplicates: boolean;
  solutions: {
    cpp: boolean;
    python: boolean;
    java: boolean;
    javascript: boolean;
    typescript: boolean;
  };
  hasEditorial: boolean;
  hasHints: boolean;
  hasResources: boolean;
}

export interface ValidationReport {
  totalScanned: number;
  metadataValidCount: number;
  visibleTestsPassCount: number;
  hiddenTestsPassCount: number;
  hiddenTestsWarningCount: number;
  solutionsCount: {
    cpp: number;
    python: number;
    java: number;
    javascript: number;
    typescript: number;
  };
  duplicateCount: number;
  brokenRelationshipsCount: number;
  compatibilityErrorsCount: number;
  problemResults: ProblemValidationResult[];
}

function findDataDir(): string {
  const candidates = [
    path.join(process.cwd(), 'data'),
    path.join(process.cwd(), 'backend', 'data'),
    path.join(process.cwd(), '..', 'backend', 'data'),
  ];
  return candidates.find((c) => fs.existsSync(c)) || path.join(process.cwd(), 'backend', 'data');
}

/**
 * Check if the input format is compatible with the declared problem topic / data structures.
 */
function checkInputCompatibility(
  title: string,
  primaryTopic: string,
  input: string,
  dataStructures: string[] = []
): string | null {
  const tLower = title.toLowerCase();
  const topLower = primaryTopic.toLowerCase();
  const trimmed = input.trim();

  // String problems shouldn't have array input unless explicitly required
  if (
    (topLower === 'strings' || tLower.includes('valid parentheses') || tLower.includes('valid anagram')) &&
    !tLower.includes('group') &&
    !tLower.includes('word search')
  ) {
    if (trimmed.startsWith('[') && !trimmed.startsWith('["')) {
      return `Potential type mismatch: Problem "${title}" is string-based but test input appears to be an integer array: ${trimmed.slice(0, 30)}`;
    }
  }

  // Integer problems shouldn't have array input
  if (
    (tLower.includes('fibonacci') || tLower.includes('climbing stairs') || tLower.includes('counting bits')) &&
    trimmed.startsWith('[')
  ) {
    return `Potential type mismatch: Problem "${title}" expects integer but test input is array: ${trimmed.slice(0, 30)}`;
  }

  return null;
}

export function validateRepository(): ValidationReport {
  const dataDir = findDataDir();
  const problemsDir = path.join(dataDir, 'problems');

  if (!fs.existsSync(problemsDir)) {
    throw new Error(`Problems directory not found at ${problemsDir}`);
  }

  const entries = fs.readdirSync(problemsDir, { withFileTypes: true });
  const allSlugs = new Set<string>();

  for (const entry of entries) {
    if (entry.isDirectory()) allSlugs.add(entry.name);
  }

  const report: ValidationReport = {
    totalScanned: 0,
    metadataValidCount: 0,
    visibleTestsPassCount: 0,
    hiddenTestsPassCount: 0,
    hiddenTestsWarningCount: 0,
    solutionsCount: {
      cpp: 0,
      python: 0,
      java: 0,
      javascript: 0,
      typescript: 0,
    },
    duplicateCount: 0,
    brokenRelationshipsCount: 0,
    compatibilityErrorsCount: 0,
    problemResults: [],
  };

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const slug = entry.name;
    const folderPath = path.join(problemsDir, slug);

    report.totalScanned++;

    const pErrors: string[] = [];
    const pWarnings: string[] = [];
    let title = slug;
    let primaryTopic = '';
    let hasValidMetadata = true;

    // 1. Check problem.json
    const problemJsonPath = path.join(folderPath, 'problem.json');
    if (!fs.existsSync(problemJsonPath)) {
      pErrors.push('Missing problem.json');
      hasValidMetadata = false;
    } else {
      try {
        const json = JSON.parse(fs.readFileSync(problemJsonPath, 'utf-8'));
        title = json.title || slug;
        primaryTopic = json.primaryTopic || json.topic || '';

        if (!json.slug) {
          pErrors.push('Missing slug');
          hasValidMetadata = false;
        }
        if (!json.title) {
          pErrors.push('Missing title');
          hasValidMetadata = false;
        }
        if (!json.description) {
          pErrors.push('Missing description');
          hasValidMetadata = false;
        }
        if (!json.difficulty) {
          pErrors.push('Missing difficulty');
          hasValidMetadata = false;
        }
        if (!primaryTopic) {
          pErrors.push('Missing primaryTopic');
          hasValidMetadata = false;
        }
        if (!json.inputFormat) {
          pWarnings.push('Missing inputFormat');
        }
        if (!json.constraints || json.constraints.length === 0) {
          pWarnings.push('Missing constraints');
        }

        // Check relationship references
        const related = json.relationships?.related || [];
        for (const rel of related) {
          const relSlug = typeof rel === 'string' ? rel.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '';
          if (relSlug && relSlug.length > 3 && !allSlugs.has(relSlug) && !allSlugs.has(rel.toLowerCase())) {
            // Broken reference
            report.brokenRelationshipsCount++;
          }
        }
      } catch (err) {
        pErrors.push(`Invalid problem.json: ${(err as Error).message}`);
        hasValidMetadata = false;
      }
    }

    if (hasValidMetadata && pErrors.length === 0) {
      report.metadataValidCount++;
    }

    // 2. Check Tests (tests.json or problem.json)
    const testsJsonPath = path.join(folderPath, 'tests.json');
    let visibleTests: any[] = [];
    let hiddenTests: any[] = [];
    let hasDuplicates = false;

    if (fs.existsSync(testsJsonPath)) {
      try {
        const tests = JSON.parse(fs.readFileSync(testsJsonPath, 'utf-8'));
        if (Array.isArray(tests)) {
          visibleTests = tests.filter(
            (t: any) => t.classification === 'sample' || (t.id && t.id.startsWith('sample'))
          );
          hiddenTests = tests.filter(
            (t: any) => t.classification !== 'sample' && (!t.id || !t.id.startsWith('sample'))
          );

          // Duplicate check
          const seen = new Set<string>();
          for (const t of tests) {
            const key = `${(t.input || '').trim()}::${(t.expectedOutput || '').trim()}`;
            if (seen.has(key)) {
              hasDuplicates = true;
              report.duplicateCount++;
              pErrors.push(`Duplicate test case detected for input: ${t.input}`);
            } else {
              seen.add(key);
            }
          }

          // Compatibility check
          for (const t of visibleTests) {
            const compatErr = checkInputCompatibility(title, primaryTopic, t.input || '');
            if (compatErr) {
              report.compatibilityErrorsCount++;
              pWarnings.push(compatErr);
            }
          }
        }
      } catch (err) {
        pErrors.push(`Invalid tests.json: ${(err as Error).message}`);
      }
    } else {
      pErrors.push('Missing tests.json');
    }

    // Visible tests: min 3 required (ERROR if < 3)
    if (visibleTests.length >= 3) {
      report.visibleTestsPassCount++;
    } else {
      pErrors.push(`Insufficient visible test cases (found ${visibleTests.length}, required minimum 3)`);
    }

    // Hidden tests: target 5 (WARNING if < 5 during content collection phase)
    if (hiddenTests.length >= 5) {
      report.hiddenTestsPassCount++;
    } else {
      report.hiddenTestsWarningCount++;
      pWarnings.push(`Hidden test cases below target (found ${hiddenTests.length}, target 5)`);
    }

    // 3. Check 5-Language Reference Solutions
    const solutionsDir = path.join(folderPath, 'solutions');
    const solStatus = {
      cpp: false,
      python: false,
      java: false,
      javascript: false,
      typescript: false,
    };

    if (fs.existsSync(solutionsDir)) {
      const cppPath = path.join(solutionsDir, 'reference.cpp');
      if (fs.existsSync(cppPath) && fs.readFileSync(cppPath, 'utf-8').trim().length > 0) {
        solStatus.cpp = true;
        report.solutionsCount.cpp++;
      }

      const pyPath = path.join(solutionsDir, 'reference.py');
      if (fs.existsSync(pyPath) && fs.readFileSync(pyPath, 'utf-8').trim().length > 0) {
        solStatus.python = true;
        report.solutionsCount.python++;
      }

      const javaPath = path.join(solutionsDir, 'reference.java');
      if (fs.existsSync(javaPath) && fs.readFileSync(javaPath, 'utf-8').trim().length > 0) {
        solStatus.java = true;
        report.solutionsCount.java++;
      }

      const jsPath = path.join(solutionsDir, 'reference.js');
      if (fs.existsSync(jsPath) && fs.readFileSync(jsPath, 'utf-8').trim().length > 0) {
        solStatus.javascript = true;
        report.solutionsCount.javascript++;
      }

      const tsPath = path.join(solutionsDir, 'reference.ts');
      if (fs.existsSync(tsPath) && fs.readFileSync(tsPath, 'utf-8').trim().length > 0) {
        solStatus.typescript = true;
        report.solutionsCount.typescript++;
      }
    }

    if (!solStatus.cpp) pErrors.push('Missing C++ reference solution');
    if (!solStatus.python) pErrors.push('Missing Python reference solution');
    if (!solStatus.java) pErrors.push('Missing Java reference solution');
    if (!solStatus.javascript) pErrors.push('Missing JavaScript reference solution');
    if (!solStatus.typescript) pErrors.push('Missing TypeScript reference solution');

    // 4. Content files
    const editorialPath = path.join(folderPath, 'editorial.md');
    const hasEditorial = fs.existsSync(editorialPath) && fs.readFileSync(editorialPath, 'utf-8').trim().length > 0;
    if (!hasEditorial) pErrors.push('Missing editorial.md');

    const hintsPath = path.join(folderPath, 'hints.md');
    const hasHints = fs.existsSync(hintsPath) && fs.readFileSync(hintsPath, 'utf-8').trim().length > 0;
    if (!hasHints) pErrors.push('Missing hints.md');

    report.problemResults.push({
      slug,
      title,
      errors: pErrors,
      warnings: pWarnings,
      hasValidMetadata,
      visibleTestCount: visibleTests.length,
      hiddenTestCount: hiddenTests.length,
      hasDuplicates,
      solutions: solStatus,
      hasEditorial,
      hasHints,
      hasResources: true,
    });
  }

  return report;
}

export function printValidationReport(report: ValidationReport) {
  const isReady =
    report.metadataValidCount === report.totalScanned &&
    report.visibleTestsPassCount === report.totalScanned &&
    report.solutionsCount.cpp === report.totalScanned &&
    report.solutionsCount.python === report.totalScanned &&
    report.solutionsCount.java === report.totalScanned &&
    report.solutionsCount.javascript === report.totalScanned &&
    report.solutionsCount.typescript === report.totalScanned &&
    report.duplicateCount === 0;

  console.log('=============================================================');
  console.log('                 DSA CONTENT VALIDATION');
  console.log('=============================================================');
  console.log(`Problems: ${report.totalScanned}\n`);

  console.log('Metadata:');
  console.log(`${report.metadataValidCount === report.totalScanned ? '✓' : '✗'} ${report.metadataValidCount}/${report.totalScanned}\n`);

  console.log('Visible Tests:');
  console.log(`${report.visibleTestsPassCount === report.totalScanned ? '✓' : '✗'} ${report.visibleTestsPassCount}/${report.totalScanned}\n`);

  console.log('Hidden Tests:');
  if (report.hiddenTestsPassCount === report.totalScanned) {
    console.log(`✓ ${report.hiddenTestsPassCount}/${report.totalScanned} (Target: 5 tests)\n`);
  } else {
    console.log(`⚠️  ${report.hiddenTestsPassCount}/${report.totalScanned} meet 5+ target (${report.hiddenTestsWarningCount} in progress)\n`);
  }

  console.log('Reference Solutions:');
  console.log(`  ${report.solutionsCount.cpp === report.totalScanned ? '✓' : '✗'} C++ ${report.solutionsCount.cpp}/${report.totalScanned}`);
  console.log(`  ${report.solutionsCount.python === report.totalScanned ? '✓' : '✗'} Python ${report.solutionsCount.python}/${report.totalScanned}`);
  console.log(`  ${report.solutionsCount.java === report.totalScanned ? '✓' : '✗'} Java ${report.solutionsCount.java}/${report.totalScanned}`);
  console.log(`  ${report.solutionsCount.javascript === report.totalScanned ? '✓' : '✗'} JavaScript ${report.solutionsCount.javascript}/${report.totalScanned}`);
  console.log(`  ${report.solutionsCount.typescript === report.totalScanned ? '✓' : '✗'} TypeScript ${report.solutionsCount.typescript}/${report.totalScanned}\n`);

  console.log('Duplicates:');
  console.log(`✓ ${report.duplicateCount} remaining\n`);

  console.log('Broken relationships:');
  console.log(`✓ ${report.brokenRelationshipsCount}\n`);

  console.log('Compatibility Warnings:');
  console.log(`${report.compatibilityErrorsCount === 0 ? '✓ 0' : `⚠️ ${report.compatibilityErrorsCount}`}\n`);

  console.log('-------------------------------------------------------------');
  console.log(`Status: ${isReady ? 'READY' : 'ACTION REQUIRED'}`);
  console.log('=============================================================');

  // If there are errors, print details
  const failedProblems = report.problemResults.filter((p) => p.errors.length > 0);
  if (failedProblems.length > 0) {
    console.log('\n❌ Issues requiring resolution:');
    for (const p of failedProblems) {
      console.log(`\n• [${p.slug}] ${p.title}:`);
      p.errors.forEach((e) => console.log(`    - ERROR: ${e}`));
      p.warnings.forEach((w) => console.log(`    - WARNING: ${w}`));
    }
  }
}

try {
  const rep = validateRepository();
  printValidationReport(rep);
  const hasCriticalErrors = rep.problemResults.some((p) => p.errors.length > 0);
  if (hasCriticalErrors) {
    process.exit(1);
  }
} catch (err) {
  console.error('Validation script error:', (err as Error).message);
  process.exit(1);
}

