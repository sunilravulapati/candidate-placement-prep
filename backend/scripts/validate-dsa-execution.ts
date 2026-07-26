// backend/scripts/validate-dsa-execution.ts

import fs from 'fs';
import path from 'path';

function findDataDir(): string {
  const candidates = [
    path.join(process.cwd(), 'data'),
    path.join(process.cwd(), 'backend', 'data'),
    path.join(process.cwd(), '..', 'backend', 'data'),
  ];
  return candidates.find((c) => fs.existsSync(c)) || path.join(process.cwd(), 'backend', 'data');
}

export interface ValidationReport {
  timestamp: string;
  totalProblems: number;
  totalVisibleTests: number;
  totalHiddenTests: number;
  totalDuplicateVisibleRemoved: number;
  totalDuplicateHiddenRemoved: number;
  metrics: {
    missingVisibleTestsCount: number;
    missingHiddenTestsCount: number;
    missingReferenceSolutionsCount: number;
    missingStarterCodeCount: number;
    missingInputHelperCount: number;
    missingHintsCount: number;
    missingResourcesCount: number;
    brokenLinksCount: number;
    duplicateSlugsCount: number;
    malformedInputsCount: number;
    malformedOutputsCount: number;
    validationErrorsCount: number;
  };
  problemDetails: Array<{
    slug: string;
    title: string;
    visibleTestsCount: number;
    hiddenTestsCount: number;
    hasReferenceSolutions: boolean;
    hasStarterCode: boolean;
    hasInputHelper: boolean;
    hasHints: boolean;
    issues: string[];
  }>;
}

export function runValidationPipeline(): ValidationReport {
  console.log(`=============================================================`);
  console.log(`🔍 PrepGenie DSA Validation & Health Inspection Pipeline`);
  console.log(`=============================================================`);

  const dataDir = findDataDir();
  const problemsDir = path.join(dataDir, 'problems');

  if (!fs.existsSync(problemsDir)) {
    console.error(`❌ Error: Problems directory not found at ${problemsDir}`);
    process.exit(1);
  }

  const problemFolders = fs.readdirSync(problemsDir).filter((f) => {
    return fs.statSync(path.join(problemsDir, f)).isDirectory();
  });

  console.log(`Checking ${problemFolders.length} problem directories in ${problemsDir}...`);

  const seenSlugs = new Set<string>();
  const problemDetails: ValidationReport['problemDetails'] = [];

  let totalVisibleTests = 0;
  let totalHiddenTests = 0;
  let missingVisibleTestsCount = 0;
  let missingHiddenTestsCount = 0;
  let missingReferenceSolutionsCount = 0;
  let missingStarterCodeCount = 0;
  let missingInputHelperCount = 0;
  let missingHintsCount = 0;
  let missingResourcesCount = 0;
  let brokenLinksCount = 0;
  let duplicateSlugsCount = 0;
  let malformedInputsCount = 0;
  let malformedOutputsCount = 0;
  let totalValidationErrors = 0;

  for (const slug of problemFolders) {
    const folderPath = path.join(problemsDir, slug);
    const problemJsonPath = path.join(folderPath, 'problem.json');
    const hintsPath = path.join(folderPath, 'hints.md');
    const solutionsDir = path.join(folderPath, 'solutions');

    const issues: string[] = [];

    if (seenSlugs.has(slug)) {
      duplicateSlugsCount++;
      issues.push(`Duplicate slug detected: ${slug}`);
    } else {
      seenSlugs.add(slug);
    }

    if (!fs.existsSync(problemJsonPath)) {
      issues.push(`Missing problem.json file`);
      totalValidationErrors++;
      continue;
    }

    let probData: any = {};
    try {
      probData = JSON.parse(fs.readFileSync(problemJsonPath, 'utf-8'));
    } catch (e) {
      issues.push(`Malformed problem.json: ${(e as Error).message}`);
      totalValidationErrors++;
      continue;
    }

    const title = probData.title || slug;
    const visTests = probData.visibleTests || probData.sampleTests || [];
    const hidTests = probData.hiddenTests || [];

    totalVisibleTests += visTests.length;
    totalHiddenTests += hidTests.length;

    if (visTests.length < 3) {
      missingVisibleTestsCount++;
      issues.push(`Insufficient visible tests: ${visTests.length} (Expected >= 3)`);
    }

    if (hidTests.length < 5) {
      missingHiddenTestsCount++;
      issues.push(`Insufficient hidden tests: ${hidTests.length} (Expected >= 5)`);
    }

    // Check duplicate tests within problem
    const visKeys = new Set<string>();
    for (const vt of visTests) {
      if (!vt.input || typeof vt.input !== 'string') malformedInputsCount++;
      if (vt.expectedOutput === undefined) malformedOutputsCount++;
      const k = `${vt.input}::${vt.expectedOutput}`;
      if (visKeys.has(k)) {
        issues.push(`Duplicate visible test case found: ${vt.input}`);
      }
      visKeys.add(k);
    }

    const hidKeys = new Set<string>();
    for (const ht of hidTests) {
      if (!ht.input || typeof ht.input !== 'string') malformedInputsCount++;
      if (ht.expectedOutput === undefined) malformedOutputsCount++;
      const k = `${ht.input}::${ht.expectedOutput}`;
      if (hidKeys.has(k)) {
        issues.push(`Duplicate hidden test case found: ${ht.input}`);
      }
      hidKeys.add(k);
    }

    // Check Reference Solutions
    let hasRefSol = false;
    if (fs.existsSync(solutionsDir)) {
      const files = fs.readdirSync(solutionsDir);
      hasRefSol = files.length > 0;
    }
    if (!hasRefSol && !probData.referenceSolutions) {
      missingReferenceSolutionsCount++;
      issues.push(`Missing reference solutions in solutions/ directory`);
    } else {
      hasRefSol = true;
    }

    // Check Starter Code
    const hasStarterCode = Boolean(
      probData.starterCode &&
        (probData.starterCode.cpp ||
          probData.starterCode.python ||
          probData.starterCode.java ||
          probData.starterCode.javascript ||
          probData.starterCode.typescript)
    );
    if (!hasStarterCode) {
      missingStarterCodeCount++;
      issues.push(`Missing starter code for problem`);
    }

    // Check Input Helper
    const hasInputHelper = Boolean(probData.inputHelper || probData.inputTemplates);
    if (!hasInputHelper) {
      missingInputHelperCount++;
      issues.push(`Missing input helper metadata`);
    }

    // Check Hints
    const hasHints = Boolean(fs.existsSync(hintsPath) || (probData.hints && probData.hints.length > 0));
    if (!hasHints) {
      missingHintsCount++;
      issues.push(`Missing hints`);
    }

    // Check Resources & External Links
    const resources = probData.resources || [];
    if (resources.length === 0) {
      missingResourcesCount++;
    } else {
      for (const r of resources) {
        if (!r.url || !r.url.startsWith('http')) {
          brokenLinksCount++;
          issues.push(`Broken resource link: ${r.url}`);
        }
      }
    }

    if (issues.length > 0) {
      totalValidationErrors += issues.length;
    }

    problemDetails.push({
      slug,
      title,
      visibleTestsCount: visTests.length,
      hiddenTestsCount: hidTests.length,
      hasReferenceSolutions: hasRefSol,
      hasStarterCode,
      hasInputHelper,
      hasHints,
      issues,
    });
  }

  const report: ValidationReport = {
    timestamp: new Date().toISOString(),
    totalProblems: problemFolders.length,
    totalVisibleTests,
    totalHiddenTests,
    totalDuplicateVisibleRemoved: 0,
    totalDuplicateHiddenRemoved: 0,
    metrics: {
      missingVisibleTestsCount,
      missingHiddenTestsCount,
      missingReferenceSolutionsCount,
      missingStarterCodeCount,
      missingInputHelperCount,
      missingHintsCount,
      missingResourcesCount,
      brokenLinksCount,
      duplicateSlugsCount,
      malformedInputsCount,
      malformedOutputsCount,
      validationErrorsCount: totalValidationErrors,
    },
    problemDetails,
  };

  // Write validation-report.json
  const reportPath = path.join(dataDir, 'validation-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');

  console.log(`\n=============================================================`);
  console.log(`📊 Validation Summary Metrics`);
  console.log(`=============================================================`);
  console.log(`  • Total Problems Audited: ${report.totalProblems}`);
  console.log(`  • Total Visible Tests: ${totalVisibleTests}`);
  console.log(`  • Total Hidden Tests: ${totalHiddenTests}`);
  console.log(`  • Duplicate Slugs: ${duplicateSlugsCount}`);
  console.log(`  • Problems Missing Visible Tests (<3): ${missingVisibleTestsCount}`);
  console.log(`  • Problems Missing Hidden Tests (<5): ${missingHiddenTestsCount}`);
  console.log(`  • Problems Missing Reference Solutions: ${missingReferenceSolutionsCount}`);
  console.log(`  • Problems Missing Starter Code: ${missingStarterCodeCount}`);
  console.log(`  • Problems Missing Input Helper: ${missingInputHelperCount}`);
  console.log(`  • Problems Missing Hints: ${missingHintsCount}`);
  console.log(`  • Total Validation Issues Found: ${totalValidationErrors}`);
  console.log(`✓ Report successfully written to ${reportPath}`);
  console.log(`=============================================================`);

  return report;
}

if (require.main === module) {
  runValidationPipeline();
}
